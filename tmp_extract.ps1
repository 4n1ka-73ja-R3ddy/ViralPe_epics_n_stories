Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('Epics_And_Stories.docx')
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
if ($entry -ne $null) {
  $reader = New-Object System.IO.StreamReader($entry.Open())
  $content = $reader.ReadToEnd()
  $reader.Close()
  $zip.Dispose()
  $content -replace '<[^>]+>', '' | Set-Content -Path 'Epics_And_Stories.txt' -Encoding utf8
}
