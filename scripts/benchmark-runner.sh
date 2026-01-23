#!/bin/bash

# Performance Benchmark Runner
# This script helps automate the benchmarking process

set -e

RESULTS_DIR="./performance-results"
BENCHMARK_SCRIPT="./scripts/performance-benchmark.mjs"
COMPARE_SCRIPT="./scripts/compare-benchmarks.mjs"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Alkemio Performance Benchmark Runner${NC}\n"

# Check if app is running
check_server() {
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: No server running on localhost:3000${NC}"
        echo "Please start your build first:"
        echo "  npx serve -s build -l 3000"
        exit 1
    fi
    echo -e "${GREEN}✓ Server is running on localhost:3000${NC}\n"
}

# Run benchmark
run_benchmark() {
    local build_name=$1
    echo -e "${YELLOW}Running benchmark for: ${build_name}${NC}"
    node "$BENCHMARK_SCRIPT" "$build_name"
    echo -e "${GREEN}✓ Benchmark complete!${NC}\n"
}

# Compare benchmarks
compare_benchmarks() {
    echo -e "${YELLOW}Comparing benchmark results...${NC}"
    node "$COMPARE_SCRIPT"
    echo -e "${GREEN}✓ Comparison complete!${NC}\n"
}

# Main menu
show_menu() {
    echo "What would you like to do?"
    echo "1) Run benchmark for current build"
    echo "2) Compare two most recent benchmarks"
    echo "3) View all benchmark results"
    echo "4) Exit"
    echo ""
    read -p "Enter your choice [1-4]: " choice

    case $choice in
        1)
            check_server
            read -p "Enter build name (e.g., 'before', 'after'): " build_name
            if [ -z "$build_name" ]; then
                echo -e "${RED}Build name cannot be empty${NC}"
                exit 1
            fi
            run_benchmark "$build_name"
            ;;
        2)
            compare_benchmarks
            ;;
        3)
            if [ -d "$RESULTS_DIR" ]; then
                echo -e "${GREEN}Benchmark results:${NC}"
                ls -lh "$RESULTS_DIR"
            else
                echo -e "${YELLOW}No benchmark results found${NC}"
            fi
            ;;
        4)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
}

# Create results directory if it doesn't exist
mkdir -p "$RESULTS_DIR"

# Run menu
show_menu
