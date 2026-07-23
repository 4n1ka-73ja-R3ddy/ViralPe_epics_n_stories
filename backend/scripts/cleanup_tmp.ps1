# Cleanup script to remove temporary artifacts mentioned in docs
$paths = @(
    "tmp_docx_extract",
    "tmp_extract.ps1",
    "tmp_parse_docx.ps1"
)

# developed by anika teja reddy
foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item -Recurse -Force $p
        Write-Host "Removed $p"
    } else {
        Write-Host "Not found: $p"
    }
}
