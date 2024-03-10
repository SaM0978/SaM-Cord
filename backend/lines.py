import os

def count_lines_in_js_files(directory):
    total_lines = 0
    file_details = []
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')  # Exclude node_modules directory
        for file in files:
            if file.endswith('.js'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    file_lines = len(lines)
                    total_lines += file_lines
                    file_details.append((file, file_lines, filepath, lines))
    return total_lines, file_details

if __name__ == "__main__":
    directory = '.'  # Current directory
    total_lines, file_details = count_lines_in_js_files(directory)
    print("Total lines in .js files (excluding node_modules):", total_lines)
    for file, lines, filepath, content in file_details:
        print(f"File: {file}, Lines: {lines}, Path: {filepath}")

    print(f"Total lines: {total_lines}")
        # Optionally, print the content of the file as well
        # for line in content:
        #     print(line.strip())
