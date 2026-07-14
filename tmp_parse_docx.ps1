Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('Epics_And_Stories.docx')
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
if ($entry -ne $null) {
  $reader = New-Object System.IO.StreamReader($entry.Open())
  $xmlText = $reader.ReadToEnd()
  $reader.Close()
  $zip.Dispose()
  $xml = New-Object System.Xml.XmlDocument
  $xml.LoadXml($xmlText)
  $nsmgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
  $nsmgr.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
  $paragraphs = @()
  foreach ($p in $xml.SelectNodes('//w:p', $nsmgr)) {
    $texts = @()
    foreach ($t in $p.SelectNodes('.//w:t', $nsmgr)) { $texts += $t.InnerText }
    $paragraphs += ($texts -join '')
  }
  $paragraphs | Set-Content -Path 'Epics_And_Stories_paragraphs.txt' -Encoding utf8
}
