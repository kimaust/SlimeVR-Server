[CmdletBinding()]
param(
	[Parameter(ValueFromRemainingArguments = $true)]
	[string[]]$JarArgs
)

$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$jarPath = Join-Path $repoRoot "server\desktop\build\libs\slimevr.jar"
$desktopDir = Join-Path $repoRoot "server\desktop"

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
	throw "Java was not found on PATH. Install Java 17+ (Temurin recommended) and ensure 'java' is available."
}

if (-not $JarArgs -or $JarArgs.Count -eq 0) {
	# SlimeVR's entrypoint expects a command; default to "run" for convenience.
	$JarArgs = @("run")
}

if (-not (Test-Path -LiteralPath $jarPath)) {
	$libsDir = Join-Path $repoRoot "server\desktop\build\libs"
	$alt = Get-ChildItem -Path $libsDir -Filter "*.jar" -ErrorAction SilentlyContinue `
		| Where-Object { $_.Name -match '^slimevr.*\.jar$' } `
		| Select-Object -First 1

	if ($alt) {
		$jarPath = $alt.FullName
	} else {
		throw @"
Could not find the jar at:
  $jarPath

Build it first with:
  .\gradlew.bat :server:desktop:shadowJar
"@
	}
}

$exitCode = 0
Push-Location $desktopDir
try {
	Write-Host "Working dir: $(Get-Location)" -ForegroundColor DarkGray
	Write-Host "Running: java -jar `"$jarPath`" $($JarArgs -join ' ')" -ForegroundColor Cyan
	& java -jar $jarPath @JarArgs
	$exitCode = $LASTEXITCODE
} finally {
	Pop-Location
}

exit $exitCode


