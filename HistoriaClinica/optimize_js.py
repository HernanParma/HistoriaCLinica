#!/usr/bin/env python3
import re

def optimize_js_file(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove single-line comments
    content = re.sub(r'^\s*//.*$', '', content, flags=re.MULTILINE)
    
    # Remove empty lines
    lines = content.split('\n')
    lines = [line for line in lines if line.strip()]
    
    # Join lines back
    optimized_content = '\n'.join(lines)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(optimized_content)
    
    print(f"Optimized {input_file} -> {output_file}")

if __name__ == "__main__":
    optimize_js_file('wwwroot/js/historia.js', 'wwwroot/js/historia_optimized.js')


