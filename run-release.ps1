[CmdletBinding()]
param(
	[Parameter(ValueFromRemainingArguments = $true)]
	[string[]]$ExeArgs
)

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$exePath = Join-Path $repoRoot "target\release\slimevr.exe"

if (-not (Test-Path -LiteralPath $exePath)) {
	$releaseDir = Join-Path $repoRoot "target\release"
	$alt = Get-ChildItem -Path $releaseDir -Filter "*.exe" -ErrorAction SilentlyContinue `
		| Where-Object { $_.Name -match '^slimevr.*\.exe$' } `
		| Select-Object -First 1

	if ($alt) {
		$exePath = $alt.FullName
	} else {
		throw @"
Could not find the exe at:
  $exePath

Build it first with:
  pnpm run tauri build
"@
	}
}

$exeDir = Split-Path -Parent $exePath
Push-Location $exeDir
try {
	Write-Host "Running: `"$exePath`" $($ExeArgs -join ' ')" -ForegroundColor Cyan
	& $exePath @ExeArgs
	exit $LASTEXITCODE
} finally {
	Pop-Location
}


