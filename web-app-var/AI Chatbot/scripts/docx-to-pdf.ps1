param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputPath
)

$wdFormatPDF = 17

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
  $doc = $word.Documents.Open($InputPath, $false, $true)
  $doc.SaveAs2($OutputPath, $wdFormatPDF)
  $doc.Close($false)
  exit 0
} catch {
  Write-Error $_.Exception.Message
  exit 1
} finally {
  $word.Quit()
  try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null } catch {}
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
