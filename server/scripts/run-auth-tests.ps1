# Authentication Test Runner Script for PowerShell
# This script helps run the comprehensive authentication tests with proper setup

param(
    [Parameter(Position=0)]
    [ValidateSet("help", "server", "db", "test", "full")]
    [string]$Action = "full"
)

# Configuration
$SERVER_URL = "http://localhost:5000"
$API_URL = "http://localhost:5000/api"
$DB_NAME = "barber-demo"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

Write-Host "🚀 BarberHub Authentication Test Runner" -ForegroundColor $Blue
Write-Host "==================================" -ForegroundColor $Blue

# Function to check if server is running
function Test-Server {
    Write-Host "Checking if server is running..." -ForegroundColor $Yellow
    try {
        $response = Invoke-WebRequest -Uri $SERVER_URL -Method GET -TimeoutSec 5 -UseBasicParsing
        Write-Host "✓ Server is running on $SERVER_URL" -ForegroundColor $Green
        return $true
    }
    catch {
        Write-Host "✗ Server is not running on $SERVER_URL" -ForegroundColor $Red
        Write-Host "Please start the server with: npm run dev" -ForegroundColor $Yellow
        return $false
    }
}

# Function to check if MongoDB is running
function Test-MongoDB {
    Write-Host "Checking MongoDB connection..." -ForegroundColor $Yellow
    try {
        $nodeScript = @"
        const mongoose = require('mongoose');
        mongoose.connect('mongodb://localhost:27017/$DB_NAME')
            .then(() => {
                console.log('MongoDB connected');
                process.exit(0);
            })
            .catch(err => {
                console.error('MongoDB connection failed:', err.message);
                process.exit(1);
            });
"@
        $nodeScript | node
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ MongoDB is running" -ForegroundColor $Green
            return $true
        } else {
            Write-Host "✗ MongoDB is not running" -ForegroundColor $Red
            Write-Host "Please start MongoDB and try again" -ForegroundColor $Yellow
            return $false
        }
    }
    catch {
        Write-Host "✗ MongoDB is not running" -ForegroundColor $Red
        Write-Host "Please start MongoDB and try again" -ForegroundColor $Yellow
        return $false
    }
}

# Function to seed database
function Invoke-SeedDatabase {
    Write-Host "Seeding database with test data..." -ForegroundColor $Yellow
    try {
        npm run seed | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database seeded successfully" -ForegroundColor $Green
            return $true
        } else {
            Write-Host "✗ Failed to seed database" -ForegroundColor $Red
            return $false
        }
    }
    catch {
        Write-Host "✗ Failed to seed database" -ForegroundColor $Red
        return $false
    }
}

# Function to run tests
function Invoke-RunTests {
    Write-Host "Running authentication tests..." -ForegroundColor $Yellow
    Write-Host "==================================" -ForegroundColor $Yellow
    
    try {
        npm run test:auth
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ All tests completed successfully" -ForegroundColor $Green
            return $true
        } else {
            Write-Host "✗ Some tests failed" -ForegroundColor $Red
            return $false
        }
    }
    catch {
        Write-Host "✗ Some tests failed" -ForegroundColor $Red
        return $false
    }
}

# Function to show help
function Show-Help {
    Write-Host "Usage: .\run-auth-tests.ps1 [ACTION]" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor $Blue
    Write-Host "  help     Show this help message" -ForegroundColor $Blue
    Write-Host "  server   Only check server status" -ForegroundColor $Blue
    Write-Host "  db       Only check database status" -ForegroundColor $Blue
    Write-Host "  test     Only run tests (assumes setup is complete)" -ForegroundColor $Blue
    Write-Host "  full     Full setup and test run (default)" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor $Blue
    Write-Host "  .\run-auth-tests.ps1              # Full setup and test" -ForegroundColor $Blue
    Write-Host "  .\run-auth-tests.ps1 server       # Check server only" -ForegroundColor $Blue
    Write-Host "  .\run-auth-tests.ps1 test         # Run tests only" -ForegroundColor $Blue
}

# Main execution flow
switch ($Action) {
    "help" {
        Show-Help
        exit 0
    }
    "server" {
        if (Test-Server) {
            exit 0
        } else {
            exit 1
        }
    }
    "db" {
        if (Test-MongoDB) {
            exit 0
        } else {
            exit 1
        }
    }
    "test" {
        if (Invoke-RunTests) {
            exit 0
        } else {
            exit 1
        }
    }
    "full" {
        Write-Host "Starting full authentication test setup..." -ForegroundColor $Blue
        
        # Check prerequisites
        if (-not (Test-Server)) {
            exit 1
        }
        
        if (-not (Test-MongoDB)) {
            exit 1
        }
        
        # Seed database
        if (-not (Invoke-SeedDatabase)) {
            exit 1
        }
        
        # Run tests
        if (-not (Invoke-RunTests)) {
            exit 1
        }
        
        Write-Host "🎉 All authentication tests completed successfully!" -ForegroundColor $Green
        Write-Host "Check the output above for detailed results." -ForegroundColor $Blue
    }
} 