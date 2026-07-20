<!-- Slide number: 1 -->
COMPUTER PROGRAMMING USING C

![E:\Workshop_powerPoint\Pictures\785_LPU.png](Picture2.jpg)
CSE22D
UNIT 6

Department of Computer Science  Engineering | School of Polytechnic | Lovely Professional University |

Slide 1 of 17

<!-- Slide number: 2 -->
# UNIT 6

FILES IN C
Slide 2 of 17

### Notes:

<!-- Slide number: 3 -->
# Introduction to Files
In C programming, files are used to store data permanently on disk, unlike variables that store data temporarily in RAM. File handling allows programs to read, write, and modify data even after the program ends.
Slide 3 of 17

<!-- Slide number: 4 -->
# Need for File Handling
Data stored in variables is lost when the program terminates.
To store data permanently, we use files on the disk.
Files allow input and output operations (I/O) with external storage devices.

Slide 4 of 17

<!-- Slide number: 5 -->
# FILE
A file represents a sequence of bytes on the disk where a group of related data is stored.

File is created for permanent storage of data. It is a ready made structure.

In C language, we use a structure pointer of file type to declare a file.

FILE   *fp;

<!-- Slide number: 6 -->
# Types of Files
When dealing with files, there are two types of files you should know about:

Text files

Binary files

<!-- Slide number: 7 -->
# Text Files
Text files are the normal .txt files that you can easily create using Notepad or any simple text editors.

When you open those files, you'll see all the contents within the file as plain text. You can easily edit or delete the contents.

They take minimum effort to maintain, are easily readable, and provide least security and takes bigger storage space.

<!-- Slide number: 8 -->
# Binary Files
Binary files are mostly the .bin files in your computer.

Instead of storing data in plain text, they store it in the binary form (0's and 1's).

They can hold higher amount of numerical data, are not readable easily and provides a better security than text files.

<!-- Slide number: 9 -->
# Difference between text file and binary file
Text file is human readable because everything is stored in terms of text. In binary file everything is written in terms of 0 and 1, therefore binary file is not human readable.

In text file, a special character, whose ASCII value is 26, is inserted after the last character in the file to mark the end of file. There is no such special character present in the binary mode files to mark the end of file.

<!-- Slide number: 10 -->
# File Operations in CTo handle files, C provides a set of file I/O functions from the header file <stdio.h>.
| Operation | Function | Description |
| --- | --- | --- |
| Create/Open a file | fopen() | Opens a file for reading, writing, or appending |
| Read from a file | fscanf(), fgets(), fread() | Reads data from file |
| Write to a file | fprintf(), fputs(), fwrite() | Writes data into file |
| Close a file | fclose() | Closes an opened file |
Slide 10 of 17

<!-- Slide number: 11 -->
# File Handling in C: Declaring and Using Files
1. Introduction
In C, before performing any operation on a file (like reading or writing), we must declare a file pointer.A file pointer is a special pointer variable that stores the address of the file control block, which keeps track of the file being used.

Slide 11 of 17

<!-- Slide number: 12 -->
# Declaring a File Pointer
A file in C is always declared using the FILE data type, defined in the header file <stdio.h>.
Syntax:
FILE *file_pointer;
Example:
FILE *fp;
Here, fp is a pointer to a structure of type FILE that holds information about the file — such as file name, current position, and mode (read/write).

Slide 12 of 17

<!-- Slide number: 13 -->
# Opening a File
Before we can read (or write) information from (to) a file on a disk we must open the file.
To open the file we have called the function fopen( ).

ptr = fopen("file path","mode")
fopen("E:\\cprogram\\newprogram.txt","w");

fopen("E:\\cprogram\\oldprogram.bin","rb");

<!-- Slide number: 14 -->
# Opening a File

![](Picture3.jpg)

<!-- Slide number: 15 -->
# Checking File Opening Success
Before working with the file, always verify that it opened successfully.
if (fp == NULL) {
    printf("Error! File cannot be opened.\n");
    return 1;
}

Slide 15 of 17

<!-- Slide number: 16 -->
# Closing a File
The file (both text and binary) should be closed after reading/writing.
Closing a file is performed using library function fclose().
Flushes any unwritten data from memory.
Discards any unread buffered input.
Frees any automatically allocated buffer
Finally, close the file.

fclose(fptr);

<!-- Slide number: 17 -->
# Reading and Writing to a Text File
For reading and writing to a text file, we use the functions
fprintf() and
fscanf().

They are just the file versions of printf() and scanf(). The only difference is that, fprint() and fscanf() accepts a pointer to the structure FILE.

<!-- Slide number: 18 -->
# Operations on Files — Reading, Writing, and Appending
1. Introduction
File operations in C allow programs to store data permanently on disk.The main file operations are:
Writing to a file — store data in a file.
Reading from a file — retrieve data from a file.
Appending to a file — add new data at the end of an existing file.
All file operations use the library <stdio.h> and the file pointer of type FILE *.

Slide 18 of 17

<!-- Slide number: 19 -->
# Writing on a File
Function used:
fprintf() → formatted writing
fputs() → writes string
fwrite() → writes binary data
Syntax:
FILE *fp;
fp = fopen("filename.txt", "w");
"w" → opens file for writing (creates new file or overwrites existing)

Slide 19 of 17

<!-- Slide number: 20 -->
# Example:
#include <stdio.h>
int main() {
    FILE *fp;
    fp = fopen("student.txt", "w");  // Open file for writing

    if (fp == NULL) {
        printf("Error opening file!\n");
        return 1;
    }
    fprintf(fp, "Name: Aman\nAge: 20\nCourse: C Programming\n");
    fclose(fp);
    printf("Data written successfully!\n");
    return 0;
}

Slide 20 of 17

<!-- Slide number: 21 -->
# Output:
Data written successfully!
File Content (student.txt):
Name: Aman
Age: 20
Course: C Programming

Slide 21 of 17

<!-- Slide number: 22 -->
# Reading from a File
Functions used:
fscanf() → formatted reading
fgets() → reads a string
fread() → reads binary data
Syntax:
fp = fopen("filename.txt", "r");
"r" → opens file for reading (file must exist)

Slide 22 of 17

<!-- Slide number: 23 -->
# Example:
#include <stdio.h>
int main() {
    FILE *fp;
    char ch;
    fp = fopen("student.txt", "r");
    if (fp == NULL) {
        printf("Error opening file!\n");
        return 1;
    }
    while ((ch = fgetc(fp)) != EOF) {  // Read character by character
        putchar(ch);
    }
    fclose(fp);
    return 0;
}

Slide 23 of 17

<!-- Slide number: 24 -->
# Output (Display of file content):
Name: Aman
Age: 20
Course: C Programming

Slide 24 of 17

<!-- Slide number: 25 -->
# Appending to a File
Function used:
Same as writing (fprintf, fputs), but use mode "a".
Syntax:
fp = fopen("filename.txt", "a");
"a" → opens file for appending (creates if not exists)

Slide 25 of 17

<!-- Slide number: 26 -->
# Example:
#include <stdio.h>
int main() {
    FILE *fp;
    fp = fopen("student.txt", "a");  // Open for appending
    if (fp == NULL) {
        printf("Error opening file!\n");
        return 1;
    }
    fprintf(fp, "Department: CSE\n");
    fclose(fp);
    printf("New data appended successfully!\n");
    return 0;
}

Slide 26 of 17

<!-- Slide number: 27 -->
# Updated File Content:
Name: Aman
Age: 20
Course: C Programming
Department: CSE

Slide 27 of 17

<!-- Slide number: 28 -->
# File Modes
| Mode | Meaning | Description |
| --- | --- | --- |
| "r" | Read | Opens file for reading; file must exist |
| "w" | Write | Opens file for writing; overwrites file if exists |
| "a" | Append | Opens file for appending; adds data at end |
| "r+" | Read + Write | Opens existing file for both operations |
| "w+" | Write + Read | Creates new file for both operations |
| "a+" | Append + Read | Opens file for appending and reading |
Slide 28 of 17

<!-- Slide number: 29 -->
# Random Access of a File
1. Introduction
So far, you’ve learned sequential file access, where data is read or written in order, from beginning to end.
However, sometimes you need to directly access a particular part of a file — for example:
Editing only one student’s record in a file of 100 students.
Reading data from the middle of a large log file.
This is called Random Access or Direct Access.

Slide 29 of 17

<!-- Slide number: 30 -->
# What is Random Access?
Random access allows you to move the file pointer to any location in a file and read/write data from that position.
In C, this is done using:
fseek() — moves the file pointer to a specific location.
ftell() — tells the current position of the file pointer.
rewind() — moves the file pointer back to the beginning.

Slide 30 of 17

<!-- Slide number: 31 -->
# Functions Used
a) fseek()
Moves the file pointer to a specific byte position.
Syntax:
fseek(FILE *fp, long offset, int origin);

Slide 31 of 17

<!-- Slide number: 32 -->
#
| Parameter | Description |
| --- | --- |
| fp | File pointer |
| offset | Number of bytes to move |
| origin | Position to start from — can be: • SEEK\_SET – Beginning of file • SEEK\_CUR – Current position • SEEK\_END – End of file |
Example:
fseek(fp, 10, SEEK_SET); // Moves to 10th byte from start
Slide 32 of 17

<!-- Slide number: 33 -->
# b) ftell()
Returns the current position of the file pointer.
Syntax:
long position = ftell(fp);
c) rewind()
Moves the file pointer back to the beginning of the file.
Syntax:
rewind(fp);

Slide 33 of 17

<!-- Slide number: 34 -->
# Example: Random Access in File
#include <stdio.h>
#include <stdlib.h>
int main() {
    FILE *fp;
    char data[100];
    // Step 1: Create and write to a file
    fp = fopen("random.txt", "w+");
    if (fp == NULL) {
        printf("Error opening file!\n");
        return 1;
    }
    fputs("ABCDEFGHIJ", fp); // Write 10 characters
    // Step 2: Move file pointer to 5th character (index 4)
    fseek(fp, 4, SEEK_SET);
    // Step 3: Write new data at that position
    fputs("XYZ", fp);
    // Step 4: Rewind and display file content
    rewind(fp);
    fgets(data, 100, fp);
    printf("Updated File Content: %s\n", data);
    fclose(fp);
    return 0;
}

Slide 34 of 17

<!-- Slide number: 35 -->
# Example: Reading from Specific Position
#include <stdio.h>
int main() {
    FILE *fp;
    char ch;
    fp = fopen("random.txt", "r");
    if (fp == NULL) {
        printf("File not found!\n");
        return 1;
    }
    fseek(fp, 6, SEEK_SET); // Move to 7th character
    while ((ch = fgetc(fp)) != EOF) {
        printf("%c", ch);
    }
    fclose(fp);
    return 0;
}

Slide 35 of 17

<!-- Slide number: 36 -->
# OUTPUT
ZHIJ

Slide 36 of 17

<!-- Slide number: 37 -->
# Command Line Arguments
1. Introduction
Normally, when a C program runs, we input data inside the program using scanf() or read it from a file.However, sometimes we want to pass information to the program at the time of execution, without modifying the code or using scanf().
This is done using Command Line Arguments.

Slide 37 of 17

<!-- Slide number: 38 -->
# What are Command Line Arguments?
Command Line Arguments are parameters passed to the main() function when the program is executed from the terminal or command prompt.
They allow users to:
Give input filenames, numbers, or options when running the program.
Make programs more flexible and reusable.

Slide 38 of 17

<!-- Slide number: 39 -->
# Syntax of main() with Command Line Arguments
int main(int argc, char *argv[])

| Parameter | Description |
| --- | --- |
| argc | Argument Count – total number of arguments passed including program name |
| argv | Argument Vector – array of character pointers (strings) containing arguments |
Slide 39 of 17

<!-- Slide number: 40 -->
# Example 1: Display Command Line Arguments
#include <stdio.h>

int main(int argc, char *argv[]) {
    int i;
    printf("Total Arguments: %d\n", argc);

    for (i = 0; i < argc; i++) {
        printf("Argument %d: %s\n", i, argv[i]);
    }

    return 0;
}

Slide 40 of 17

<!-- Slide number: 41 -->
# Command to Run:
./a.out Hello World 123
OUTPUT:
Total Arguments: 4
Argument 0: ./a.out
Argument 1: Hello
Argument 2: World
Argument 3: 123

Slide 41 of 17

<!-- Slide number: 42 -->
# Example 2: Adding Two Numbers from Command Line
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc != 3) {
        printf("Usage: %s num1 num2\n", argv[0]);
        return 1;
    }

    int a = atoi(argv[1]);  // convert string to integer
    int b = atoi(argv[2]);
    int sum = a + b;

    printf("Sum = %d\n", sum);
    return 0;
}

Slide 42 of 17

<!-- Slide number: 43 -->
# Command to Run:
./a.out 10 20
OUTPUT:
Sum = 30

Slide 43 of 17

<!-- Slide number: 44 -->
# Example 3: Copy File Content Using Command Line Arguments
Key Points

| Term | Meaning |
| --- | --- |
| argc | Holds number of arguments |
| argv[0] | Program name |
| argv[1], argv[2] | User-supplied arguments |
| atoi() | Converts string to integer |
| atof() | Converts string to float |
Slide 44 of 17
