Write-Host "Setting Vercel environment variables..."
Write-Host "Reading from .env.local..."

if (-not (Test-Path ".env.local")) {
    Write-Error "ERROR: .env.local not found"
    exit 1
}

$vars = [ordered]@{}

Get-Content ".env.local" | ForEach-Object {
    $line = $_.Trim()
    if ($line.StartsWith("#") -or [string]::IsNullOrWhiteSpace($line)) {
        return
    }

    $eqIdx = $line.IndexOf("=")
    if ($eqIdx -le 0) { return }

    $varName = $line.Substring(0, $eqIdx).Trim()
    $varValue = $line.Substring($eqIdx + 1).Trim().Trim('"').Trim("'")

    if ([string]::IsNullOrWhiteSpace($varValue) -or $varValue -eq "PASTE_HERE" -or $varValue -eq "your_key_here") {
        return
    }

    # Ignore Vercel CLI generated tokens
    if ($varName -eq "VERCEL_OIDC_TOKEN") {
        return
    }

    $vars[$varName] = $varValue
}

# Production overrides
$vars["NEXTAUTH_URL"] = "https://verdict.vercel.app"
$vars["NEXT_PUBLIC_APP_URL"] = "https://verdict.vercel.app"
$vars["NODE_ENV"] = "production"

foreach ($varName in $vars.Keys) {
    $varValue = $vars[$varName]
    Write-Host "Setting: $varName"
    & vercel env add $varName production --value $varValue --force --yes 2>&1 | Out-Null
    & vercel env add $varName preview --value $varValue --force --yes 2>&1 | Out-Null
}

Write-Host "Done setting environment variables."
