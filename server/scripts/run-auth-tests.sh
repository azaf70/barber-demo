#!/bin/bash

# Authentication Test Runner Script
# This script helps run the comprehensive authentication tests with proper setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_URL="http://localhost:3001"
API_URL="http://localhost:3001/api"
DB_NAME="barber-demo"

echo -e "${BLUE}🚀 BarberHub Authentication Test Runner${NC}"
echo "=================================="

# Function to check if server is running
check_server() {
    echo -e "${YELLOW}Checking if server is running...${NC}"
    if curl -s "$SERVER_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server is running on $SERVER_URL${NC}"
        return 0
    else
        echo -e "${RED}✗ Server is not running on $SERVER_URL${NC}"
        echo -e "${YELLOW}Please start the server with: npm run dev${NC}"
        return 1
    fi
}

# Function to check if MongoDB is running
check_mongodb() {
    echo -e "${YELLOW}Checking MongoDB connection...${NC}"
    if node -e "
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
    " 2>/dev/null; then
        echo -e "${GREEN}✓ MongoDB is running${NC}"
        return 0
    else
        echo -e "${RED}✗ MongoDB is not running${NC}"
        echo -e "${YELLOW}Please start MongoDB and try again${NC}"
        return 1
    fi
}

# Function to seed database
seed_database() {
    echo -e "${YELLOW}Seeding database with test data...${NC}"
    if npm run seed > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database seeded successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to seed database${NC}"
        return 1
    fi
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}Running authentication tests...${NC}"
    echo "=================================="
    
    if npm run test:auth; then
        echo -e "${GREEN}✓ All tests completed successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Some tests failed${NC}"
        return 1
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -s, --server   Only check server status"
    echo "  -d, --db       Only check database status"
    echo "  -t, --test     Only run tests (assumes setup is complete)"
    echo "  -f, --full     Full setup and test run (default)"
    echo ""
    echo "Examples:"
    echo "  $0              # Full setup and test"
    echo "  $0 --server     # Check server only"
    echo "  $0 --test       # Run tests only"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -s|--server)
        check_server
        exit $?
        ;;
    -d|--db)
        check_mongodb
        exit $?
        ;;
    -t|--test)
        run_tests
        exit $?
        ;;
    -f|--full|"")
        # Full setup and test (default)
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}"
        show_help
        exit 1
        ;;
esac

# Main execution flow
echo -e "${BLUE}Starting full authentication test setup...${NC}"

# Check prerequisites
if ! check_server; then
    exit 1
fi

if ! check_mongodb; then
    exit 1
fi

# Seed database
if ! seed_database; then
    exit 1
fi

# Run tests
if ! run_tests; then
    exit 1
fi

echo -e "${GREEN}🎉 All authentication tests completed successfully!${NC}"
echo -e "${BLUE}Check the output above for detailed results.${NC}" 