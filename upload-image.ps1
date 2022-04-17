$ipv4 = (Get-NetIPAddress | Where-Object { $_.AddressState -eq "Preferred" -and $_.ValidLifetime -lt "24:00:00" }).IPAddress
$Port = '7070'

function Publish-Image {
  param (
    $ImagePath
  )
  Write-Output (curl.exe -X POST -s -F ('"file=@' + $ImagePath + '"') ('http://' + $ipv4 + ':' + $Port + '/upload'))
}

Write-Output 'Upload Success:'
for ($i = 0; $i -lt $args.Count; $i++) {
  Publish-Image $args[$i]
}
