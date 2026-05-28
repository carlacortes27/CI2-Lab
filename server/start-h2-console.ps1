$projectRoot = Split-Path -Parent $PSScriptRoot
$jarPath = Join-Path $PSScriptRoot 'h2.jar'

Set-Location $projectRoot
java -jar $jarPath -web -webPort 8082 -properties $PSScriptRoot
