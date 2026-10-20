$ErrorActionPreference = 'Stop'
# Run before committing/deploying changes to static assets.
$encoding = New-Object System.Text.UTF8Encoding $false
Get-ChildItem -LiteralPath $PSScriptRoot -Filter '*.html' | ForEach-Object {
    $html = [IO.File]::ReadAllText($_.FullName)
    $html = [regex]::Replace($html, '(?<prefix>(?:src|href)=")(?<file>[^"?]+\.(?:css|js|png|jpg|jpeg))(?<query>\?[^"\s]*)?"', {
        param($match)
        $asset = Join-Path $PSScriptRoot $match.Groups['file'].Value
        if (-not (Test-Path -LiteralPath $asset -PathType Leaf)) { return $match.Value }
        $hash = (Get-FileHash -LiteralPath $asset -Algorithm SHA256).Hash.Substring(0, 12).ToLowerInvariant()
        return $match.Groups['prefix'].Value + $match.Groups['file'].Value + '?v=' + $hash + '"'
    })
    [IO.File]::WriteAllText($_.FullName, $html, $encoding)
}
