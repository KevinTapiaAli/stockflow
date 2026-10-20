param([string]$BaseUrl = 'http://localhost:8080')
$ErrorActionPreference = 'Stop'
$api = "$($BaseUrl.TrimEnd('/'))/api"
function Send-Json([string]$Method, [string]$Path, $Data) {
    $body = [System.Text.Encoding]::UTF8.GetBytes(($Data | ConvertTo-Json -Depth 8))
    Invoke-RestMethod -Method $Method -Uri "$api$Path" -ContentType 'application/json; charset=utf-8' -Body $body
}
# Ejecución voluntaria: crea datos reales de demostración.
$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds().ToString()
$category = Send-Json 'POST' '/categories' @{ name = "Demo $suffix"; description = 'Prueba manual CRUD' }
Write-Host "Categoría creada: $($category.id)"
$disposable = Send-Json 'POST' '/products' @{ name = 'Producto eliminable'; sku = "DEL-$suffix"; price = '10.00'; stock = 0; categoryId = $category.id }
Send-Json 'PATCH' "/products/$($disposable.id)" @{ name = 'Producto actualizado' } | Out-Null
Invoke-RestMethod -Method Get -Uri "$api/products/$($disposable.id)" | Format-List
Invoke-RestMethod -Method Delete -Uri "$api/products/$($disposable.id)" | Out-Null
Send-Json 'PATCH' "/categories/$($category.id)" @{ description = 'Categoría actualizada' } | Out-Null
Invoke-RestMethod -Method Delete -Uri "$api/categories/$($category.id)" | Out-Null
Write-Host 'CRUD de categoría y producto sin historial completado.'

$category = Send-Json 'POST' '/categories' @{ name = "Operaciones $suffix" }
$product = Send-Json 'POST' '/products' @{ name = 'Producto con historial'; sku = "MOV-$suffix"; price = '25.50'; stock = 0; minStock = 3; categoryId = $category.id }
Send-Json 'POST' '/inventory/movements' @{ productId = $product.id; type = 'IN'; quantity = 10; reason = 'Entrada de demostración' } | Out-Null
$sale = Send-Json 'POST' '/sales' @{ customer = 'Cliente de prueba'; items = @(@{ productId = $product.id; quantity = 2 }) }
Invoke-RestMethod -Method Get -Uri "$api/sales/$($sale.id)" | Format-List
$afterSale = Invoke-RestMethod -Uri "$api/products/$($product.id)"
if ($afterSale.stock -ne 8 -or $sale.total -ne '51.00') { throw 'Stock o total inesperado después de la venta.' }
Send-Json 'PATCH' "/sales/$($sale.id)/cancel" @{ reason = 'Anulación de demostración' } | Out-Null
$afterCancel = Invoke-RestMethod -Uri "$api/products/$($product.id)"
if ($afterCancel.stock -ne 10) { throw 'No se restituyó el stock esperado.' }
try {
    Send-Json 'PATCH' "/sales/$($sale.id)/cancel" @{ reason = 'Segundo intento de anulación' } | Out-Null
    throw 'La segunda anulación debería responder 409.'
} catch {
    if (-not $_.Exception.Response -or [int]$_.Exception.Response.StatusCode -ne 409) { throw }
    Write-Host 'Segunda anulación rechazada con 409, como se esperaba.'
}
$finalProduct = Invoke-RestMethod -Uri "$api/products/$($product.id)"
if ($finalProduct.stock -ne 10) { throw 'La segunda anulación modificó indebidamente el stock.' }
Invoke-RestMethod -Uri "$api/dashboard/summary" | Format-List
Write-Host "Demostración terminada. Se conservan producto $($product.id) y venta $($sale.id) como historial."
