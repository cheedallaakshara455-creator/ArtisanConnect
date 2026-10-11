$ErrorActionPreference = 'Stop'

Write-Host 'Enter your rotated TiDB Cloud password. The value stays hidden and is not saved.' -ForegroundColor Yellow
$securePassword = Read-Host 'TiDB password' -AsSecureString
$secureJwtSecret = Read-Host 'JWT signing secret (use the same value each run)' -AsSecureString
$passwordPointer = [IntPtr]::Zero
$jwtPointer = [IntPtr]::Zero

try {
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $env:DB_PASS = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $jwtPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureJwtSecret)
    $env:JWT_SECRET = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($jwtPointer)
    if ([Text.Encoding]::UTF8.GetByteCount($env:JWT_SECRET) -lt 64) {
        throw 'JWT signing secret must contain at least 64 UTF-8 bytes.'
    }
    $env:SPRING_PROFILES_ACTIVE = 'tidb'

    & .\mvnw.cmd clean spring-boot:run
    if ($LASTEXITCODE -ne 0) {
        throw "Backend exited with code $LASTEXITCODE. Check the first database error above."
    }
}
finally {
    $env:DB_PASS = $null
    $env:JWT_SECRET = $null
    $env:SPRING_PROFILES_ACTIVE = $null
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    if ($jwtPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($jwtPointer)
    }
    $securePassword.Dispose()
    $secureJwtSecret.Dispose()
}
