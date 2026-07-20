<!-- Slide number: 1 -->
COMPUTER PROGRAMMING USING C

![E:\Workshop_powerPoint\Pictures\785_LPU.png](Picture2.jpg)
CSE22D
UNIT I

Department of Computer Science  Engineering | School of Polytechnic | Lovely Professional University |

Slide 1 of 17

<!-- Slide number: 2 -->
# Steps in development of a program
When we want to develop a program using any programming language, we follow a sequence of steps. These steps are called phases in program development. The program development life cycle is a set of steps or phases that are used to develop a program in any programming language.Generally, the program development life cycle contains 6 phases, they are as follows….
Problem Definition
Problem Analysis
Algorithm Development
Coding & Documentation
Testing & Debugging
Maintenance

Slide 2 of 17

<!-- Slide number: 3 -->
#

![program development,program development life cycle](Picture2.jpg)
Slide 3 of 17

<!-- Slide number: 4 -->
#
1. Problem Definition
In this phase, we define the problem statement and we decide the boundaries of the problem. In this phase we need to understand the problem statement, what is our requirement, what should be the output of the problem solution. These are defined in this first phase of the program development life cycle.
2. Problem Analysis
In phase 2, we determine the requirements like variables, functions, etc. to solve the problem. That means we gather the required resources to solve the problem defined in the problem definition phase. We also determine the bounds of the solution.

Slide 4 of 17

<!-- Slide number: 5 -->
#
3. Algorithm Development
During this phase, we develop a step by step procedure to solve the problem using the specification given in the previous phase. This phase is very important for program development. That means we write the solution in step by step statements.
4. Coding & Documentation
This phase uses a programming language to write or implement the actual programming instructions for the steps defined in the previous phase. In this phase, we construct the actual program. That means we write the program to solve the given problem using programming languages like C, C++, Java, etc.,

Slide 5 of 17

<!-- Slide number: 6 -->
#
5. Testing & Debugging
During this phase, we check whether the code written in the previous step is solving the specified problem or not. That means we test the program whether it is solving the problem for various input data values or not. We also test whether it is providing the desired output or not.
6. Maintenance
During this phase, the program is actively used by the users. If any enhancements found in this phase, all the phases are to be repeated to make the enhancements. That means in this phase, the solution (program) is used by the end-user. If the user encounters any problem or wants any enhancement, then we need to repeat all the phases from the starting, so that the encountered problem is solved or enhancement is added.

Slide 6 of 17

<!-- Slide number: 7 -->
# Program Development Tools
Algorithm
Flow chart
Pseudo-code

Slide 7 of 17

<!-- Slide number: 8 -->
# What is an Algorithm?
An algorithm is a step-by-step procedure to solve a problem.
If it is written in English-like sentences then, it is called PSEUDO CODE.
It is a formula or a set of steps that solves a particular problem for a specified problem. Each step in the algorithm must be specified clearly.
Slide 8 of 17

<!-- Slide number: 9 -->
# Characteristics of a Good Algorithm:
Input: There are zero or more values that are externally supplied.
Output: At least one value is produced.
Definiteness: Each step must be unambiguous, i.e., have one and only one meaning.
Finiteness:  If we trace the steps of an algorithm, then for all cases, the algorithm must terminate after a finite number of steps.
Effectiveness: Each step must be sufficiently basic that it can, in principle, be carried out by a person using only one paper and pencil.
In addition, not only is each step definite, it must also be feasible.

Slide 9 of 17

<!-- Slide number: 10 -->
# Example Algorithm: Find the Largest of Two Numbers
Step 1: StartStep 2: Read two numbers A and BStep 3: If A > B, then print A is largerStep 4: Else print B is largerStep 5: Stop
Slide 10 of 17

<!-- Slide number: 11 -->
# . Algorithm to Add Two Numbers
Step 1: Start
Step 2: Input first number (num1)
Step 3: Input second number (num2)
Step 4: Sum = num1 + num2
Step 5: Display Sum
Step 6: Stop

Slide 11 of 17

<!-- Slide number: 12 -->
# Algorithm to Check Even or Odd
v

Step 1: Start
Step 2: Input number (n)
Step 3: If n % 2 == 0
        Display "Even"
        Else
        Display "Odd"
Step 4: Stop

Slide 12 of 17

### Notes:

<!-- Slide number: 13 -->
# What is a Flowchart?
A flowchart is a graphical representation of an algorithm using symbols.
Flowcharts include inputs, outputs, sequence of actions, decision points, and process measurements.
Flowcharts normally use standard symbols to represent the different types of instructions. These symbols are used to construct the flowchart and show the step-by-step solution to the problem.
The flow chart symbols are linked together with arrows showing the process flow direction. This pictorial representation can give a step-by-step solution to the given problem.
Slide 13 of 17

<!-- Slide number: 14 -->

![](ContentPlaceholder10.jpg)
Slide 14 of 17

<!-- Slide number: 15 -->
# Rules for Drawing Flowcharts
1. A flowchart must start with a Start symbol and end with a Stop symbol (both use ovals).
2. Use standard symbols:
Oval for Start/End
Parallelogram for Input/Output
Rectangle for Process
Diamond for Decision
3. The flow of the chart should be top to bottom or left to right.
4. Use arrows to show the direction of flow between steps.
5. Each symbol should contain clear, simple text describing the step.
Slide 15 of 17

<!-- Slide number: 16 -->
#
6. Each symbol should have only one entry arrow; decision symbols can have two exit arrows (Yes/No).
7. Avoid crossed lines; arrange symbols with proper spacing and alignment.
8. For large or complex flowcharts, use connector circles to avoid confusion.
9. Keep the flowchart neat, organized, and easy to follow.
10.Verify the logic by tracing all possible paths from Start to Stop.
Slide 16 of 17

<!-- Slide number: 17 -->
# Flowchart for finding largest of two numbers:

![Write a flowchart to find the greater of two numbers? - Sarthaks eConnect | Largest Online Education Community](Picture4.jpg)
Slide 17 of 17

<!-- Slide number: 18 -->
# flowchart for finding an average of three numbers

![](Picture2.jpg)
Slide 18 of 17

<!-- Slide number: 19 -->
# Program Debugging
Debugging is the process of finding and fixing errors (bugs) in a computer program so that it runs correctly.
What is a Bug?
A bug is any mistake or error in the program that causes it to behave unexpectedly or produce incorrect results.

Slide 19 of 17

<!-- Slide number: 20 -->
# Types of Errors:
1. Syntax Errors:
Mistakes in spelling or grammar of the programming language.
Detected by the compiler.
Example: Missing semicolon in C (;)

2. Runtime Errors:
Errors that occur while the program is running.
Example: Dividing by zero, accessing an invalid array index.

3. Logical Errors:
The program runs without crashing but gives the wrong output.
Caused by incorrect logic or formula.
Hardest to find.

Slide 20 of 17

<!-- Slide number: 21 -->
# Steps in Debugging:
1. Identify the Error:
Use error messages, test results, or incorrect output to locate the issue.
2. Use a Debugger or Print Statements:
Tools like GDB, Dev C++ Debugger, or print statements can help trace the flow.
3. Analyze the Code:
Read and understand the logic.
Check for incorrect conditions, wrong calculations, or data errors.
4. Fix the Error:
Modify the code to correct the mistake.
5. Test the Program:
Run the program again to check if the error is fixed.
Try with multiple test inputs.

Slide 21 of 17

<!-- Slide number: 22 -->
# Compile & Interpreter
Why are they needed?
Computers do not understand high-level programming languages (like C, Python, Java).They only understand machine language (binary - 0s and 1s).So we use translators to convert high-level code into machine language.

Slide 22 of 17

<!-- Slide number: 23 -->
# Compiler
A compiler is a program that translates the entire source code (high-level language) into machine code at once, before execution.
Key Features:
Translates the whole program in one go.
Shows all errors after translation.
Faster execution after successful compilation.
Example Languages: C, C++, Java
But its program run time is longer and occupies a larger part of memory. It has a slow speed because a compiler goes through the entire program and then translates the entire program into machine codes.

Slide 23 of 17

<!-- Slide number: 24 -->
# Example:
In C language:
#include <stdio.h>
int main() {
   printf("Hello");
   return 0;
}
This is compiled first, then run.
Slide 24 of 17

<!-- Slide number: 25 -->
# Interpreter
An interpreter is a program that translates and executes the source code line-by-line.
 Key Features:
Translates and runs the program one line at a time.
Stops immediately if an error is found.
Slower execution, but easier for debugging.
Example Languages: Python, JavaScript

Slide 25 of 17

<!-- Slide number: 26 -->
# Example:
In Python:

print("Hello")
This is interpreted and executed immediately.

Slide 26 of 17

<!-- Slide number: 27 -->
# Difference Between Compiler and Interpreter
| S.No. | Compiler | Interpreter |
| --- | --- | --- |
| 1 | Translates entire program at once | Translates line-by-line |
| 2 | Faster execution after compilation | Slower execution as translation is line-by-line |
| 3 | Shows all errors after compilation | Shows error one by one, stops at the first error |
| 4 | Requires more memory for storing object code | Requires less memory, no object code created |
| 5 | Generates an executable file (.exe) | Does not create any executable file |
| 6 | Used in languages like C, C++, Java | Used in languages like Python, JavaScript, PHP |
| 7 | Debugging is harder (all errors at once) | Debugging is easier (errors appear step-by-step) |
| 8 | Code runs after complete translation | Code runs immediately after translation |
| 9 | Compilation takes time, but execution is fast | No compilation, but execution is slower |
| 10 | Best for production environments | Best for learning, scripting, and testing |
Slide 27 of 17

<!-- Slide number: 28 -->
# Types of Programming Languages
Computers only understand machine language (binary).To make programming easier for humans, we use different levels of languages:
1. Machine Language (ML):
Definition:
The lowest-level language written in binary code (0s and 1s) that the computer’s hardware can directly understand and execute.

Slide 28 of 17

<!-- Slide number: 29 -->
# Features:
Hardware-dependent
Fastest execution
Difficult for humans to read or write
No need for translator
Example:
10110000 01100001
This is instruction in binary.
Slide 29 of 17

<!-- Slide number: 30 -->
# Assembly Language
Definition:
A low-level language that uses mnemonics (symbols or short codes) to represent machine-level instructions.
 Features:
Easier to understand than machine language
Still hardware-dependent
Requires an Assembler to convert into machine language
Used in system programming, device drivers

Slide 30 of 17

<!-- Slide number: 31 -->
# Example:
MOV A, B
ADD A, C
(MOV = move data, ADD = add values)

Slide 31 of 17

<!-- Slide number: 32 -->
# High-Level Language (HLL)
Definition:
A language that is easy to read, write, and understand. It uses English-like words and is machine-independent.
Features:
Easy to learn and use
Can run on multiple types of computers
Requires compiler or interpreter to convert into machine language
Used in general application development

Slide 32 of 17

<!-- Slide number: 33 -->
# Example:
int a = b + c;
(Code written in C language)
Slide 33 of 17

<!-- Slide number: 34 -->
# Introduction to C Programming
What is C Language?
C is a general-purpose, high-level programming language developed by Dennis Ritchie at Bell Labs in 1972.
It is known for its simplicity, speed, and power, and is used to build system software, compilers, operating systems, and more.
Why Learn C?
Forms the foundation for learning other languages like C++, Java, and Python.
Helps understand how memory, pointers, and CPU interact with code.
Still widely used in embedded systems, kernel development, and competitive programming.

Slide 34 of 17

<!-- Slide number: 35 -->
# Key Features of C Language:
| Feature | Description |
| --- | --- |
| Simple | Easy to learn with minimal keywords |
| Fast | Executes quickly, close to machine language |
| Portable | Can run on different machines with few changes |
| Modular | Supports functions for better structure |
| Rich Library | Built-in functions and operators |
| Low-level Access | Allows memory access using pointers |
| Structured Language | Breaks program into smaller modules |
Slide 35 of 17

<!-- Slide number: 36 -->
# Structure of a Simple C Program:
#include <stdio.h>    // Preprocessor Directive

int main() {          // Main Function
   printf("Hello, World!");   // Output Statement
    return 0;         // End of program
}

Slide 36 of 17

<!-- Slide number: 37 -->
#
Explanation of Code:
#include <stdio.h> → Includes standard I/O library (needed for printf)
int main() → Main function where program execution starts
printf("Hello, World!") → Prints text to the screen
return 0 → Ends the program and returns control to OS

Slide 37 of 17

<!-- Slide number: 38 -->
# Characteristics of C Programming Language
| Characteristic | Description |
| --- | --- |
| 1. Simple | C has a small set of keywords and syntax, making it easy to learn and use. |
| 2. Fast Execution | C is a compiled language that runs quickly and efficiently. |
| 3. Portable | C programs can run on different systems with minimal changes in code. |
| 4. Structured Language | Supports modular programming using functions, making programs easy to manage. |
| 5. Rich Library | Provides many built-in functions (e.g., printf, scanf) for various tasks. |
| 6. Extensible | New features can be easily added via user-defined functions. |
| 7. Low-level Access | C allows direct memory access using pointers, making it close to hardware. |
| 8. Efficient Use of Memory | Programmers can optimize memory using techniques like dynamic allocation. |
| 9. Recursion Support | C allows functions to call themselves for solving problems like factorial, etc. |
| 10. Middle-Level Language | Combines features of both high-level and low-level languages. |
Slide 38 of 17

<!-- Slide number: 39 -->
# Usage / Applications of C Language
| Area | Examples of Use |
| --- | --- |
| 1. Operating Systems | UNIX, Linux Kernel, Windows OS components |
| 2. Embedded Systems | Microcontroller programming, industrial controllers |
| 3. Game Development | Logic-heavy and memory-sensitive parts of game engines |
| 4. Compilers | Many compilers for other languages are written in C (e.g., GCC) |
| 5. Databases | Popular databases like MySQL are written in C |
| 6. Networking | Network drivers, protocol implementation (TCP/IP stacks) |
| 7. Device Drivers | Interfacing hardware with operating system components |
| 8. System Programming | Developing system-level software close to hardware |
| 9. Scientific Computing | Programs that require high performance in simulations or calculations |
| 10. Education | Used as the first programming language in many courses due to its simplicity |
Slide 39 of 17

<!-- Slide number: 40 -->
# Input/Output (I/O) Statements in C
Input/Output (I/O) statements are used to take input from the user and display output on the screen.
Input Statements: scanf( )
Syntax:
scanf("format_specifier", &variable);
Example:
int a;
scanf("%d", &a);  // Takes an integer input from user and stores in variable a
The & (address-of) symbol is used to store the input in the correct memory location.
Slide 40 of 17

<!-- Slide number: 41 -->
#
Output Statement – printf()
printf("message or format", variable);
Example:
int a = 10;
printf("The value of a is %d", a);  // Displays: The value of a is 10

Common Format Specifiers in C:

| Data Type | Format Specifier |
| --- | --- |
| int | %d |
| float | %f |
| char | %c |
| string | %s |

<!-- Slide number: 42 -->
# Assignment Statements in C
An assignment statement is used to store a value in a variable.
variable = value;
Examples:
int a;
a = 5;             // Assigning constant value to variable
int b = 10;        // Declaration and assignment together
float pi = 3.14;   // Assigning float value

Slide 42 of 17

<!-- Slide number: 43 -->
#
You can also use expressions:
int sum;
sum = a + b;       // Assign result of expression to sum
=is the assignment operator, not equality (use == for comparison).
Always initialize variables before using them.

Slide 43 of 17

<!-- Slide number: 44 -->
# Constants in C Programming
What is a Constant?
A constant is a fixed value that does not change during the execution of a program.
Types of Constants in C

| Type | Example | Description |
| --- | --- | --- |
| Integer Constant | 10, -25 | Whole numbers, positive or negative |
| Float Constant | 3.14, -0.5 | Numbers with decimal points |
| Character Constant | 'A', 'z', '9' | A single character enclosed in single quotes |
| String Constant | "Hello", "123" | A sequence of characters in double quotes |
Slide 44 of 17

<!-- Slide number: 45 -->
# Declaring Constants Using const Keyword
const int MAX = 100;
MAX is a constant and its value cannot be changed later in the program.
Using #define for Constants
#define PI 3.1415
PI is now a symbolic constant and will be replaced by 3.1415 during compilation.
Slide 45 of 17

<!-- Slide number: 46 -->
# Key Rules for Constants
Constants cannot be modified once declared.
String constants must be in double quotes (" ").
Character constants must be in single quotes (' ').
Prefer const for typed constants, and #define for global symbolic values.
#include <stdio.h>
#define PI 3.1415

int main() {
    const int radius = 5;
    float area = PI * radius * radius;
    printf("Area of Circle: %f", area);
    return 0;
}

Slide 46 of 17

<!-- Slide number: 47 -->
# Variables in C
A variable is a named memory location used to store data. Its value can be changed during program execution.
The name itself means, the value of a variable can be changed, hence the name “Variable“.
In C Programming, we always have to declare a variable before we can use it. Note that the space is allocated to a variable in memory during execution or run-time.
C is a strongly typed language. What this means it that the type of a variable cannot be changed. Suppose we declared an integer type variable so we cannot store a character or a decimal number in that variable.
Slide 47 of 17

<!-- Slide number: 48 -->
# Rules for Naming Variables
Must begin with a letter (A–Z or a–z) or underscore (_)
Can contain letters, digits (0–9), and underscores
No special characters or spaces
Cannot use keywords (e.g., int, float)
Case-sensitive (Age ≠ age)
Slide 48 of 17

<!-- Slide number: 49 -->
# Syntax:
data_type variable_name;
Example:
int age;
float temperature;
To print variable values, use format specifiers in printf( ):
printf("Age: %d\n", age);        // for int
printf("Height: %.2f\n", height); // for float
printf("Grade: %c\n", grade);     // for char

Slide 49 of 17

<!-- Slide number: 50 -->
# Data Types in C Programming
In C, data types define the type of data a variable can store. They are essential to allocate memory and perform operations correctly.

![](Picture5.jpg)
Slide 50 of 17

<!-- Slide number: 51 -->
# Primary (Basic) Data Types
| Data Type | Description | Format Specifier | Example |
| --- | --- | --- | --- |
| int | Integer numbers (whole numbers) | %d | 10, -5 |
| float | Floating-point numbers | %f | 3.14, -0.99 |
| double | Double precision floating-point | %lf | 3.14159 |
| char | Single character | %c | 'A', '9' |
| void | Represents no value (used in functions) | — | — |
Slide 51 of 17

<!-- Slide number: 52 -->
# Derived Data Types
| Data Type | Description |
| --- | --- |
| array | Collection of elements of same type |
| pointer | Stores address of another variable |
| function | Returns a value, may take input |
| structure | Group of variables of different types |
| union | Similar to structure but with shared memory |
Slide 52 of 17

<!-- Slide number: 53 -->
# Enumeration Data Type (enum)
Used to assign names to integral constants.
enum color {RED, GREEN, BLUE};

Slide 53 of 17

<!-- Slide number: 54 -->
# Type Modifiers
Modifiers change the size or range of basic data types.

| Modifier | Description |
| --- | --- |
| short | Uses less memory for integers |
| long | More memory, for larger integers |
| signed | Can store both positive and negative values |
| unsigned | Only stores positive values |
Example: short int a;        // smaller range
                long int b;         // larger range
                unsigned int c;     // only positive numbers
Slide 54 of 17

<!-- Slide number: 55 -->
# Example:
int age = 20;
float temp = 36.6;
char grade = 'A';
double pi = 3.14159;

Slide 55 of 17

<!-- Slide number: 56 -->
# Operators in C
An operator is a symbol that tells the compiler to perform a specific mathematical or logical operation.
Types of Operators in C:

| Category | Description | Examples |
| --- | --- | --- |
| 1. Arithmetic | Basic math operations | +, -, \*, /, % |
| 2. Relational | Compare two values | ==, !=, >, <, >=, <= |
| 3. Logical | Combine conditions | &&, ` |
| 4. Assignment | Assign value to variable | =, +=, -=, \*=, /=, %= |
| 5. Increment/Decrement | Increase or decrease value | ++, -- |
| 6. Bitwise | Bit-level operations | &, ` |
| 7. Conditional (Ternary) | Short form of if-else | condition ? expr1 : expr2 |
| 8. Special | Other operators | sizeof, &, \*, ->, . |
Slide 56 of 17

<!-- Slide number: 57 -->
# What is an Expression?
An expression is a combination of variables, constants, and operators that produces a value.
Example: a+b*c
Examples of Expressions:
int a = 10, b = 5, c;
c = a + b;       // Arithmetic expression
if (a > b)       // Relational expression
printf("A is greater");

Slide 57 of 17

<!-- Slide number: 58 -->
# Points to Remember
Operator precedence defines the order in which operations are evaluated.
Associativity defines the direction (left to right or right to left).
Example of Precedence:
int result = a + b * c;  // Multiplication (*) has higher precedence than addition (+)

Slide 58 of 17

<!-- Slide number: 59 -->
# Standard and Formatted Input/Output in C
Standard I/O
Standard Input and Output refers to the basic input and output operations using functions:
printf() – Used for output (printing to screen)
scanf() – Used for input (reading from keyboard)
These functions are part of the stdio.h (Standard Input Output Header) library.
Slide 59 of 17

<!-- Slide number: 60 -->
# Formatted Input/Output
Formatted I/O allows input and output with specific formats using placeholders (format specifiers).
Common Format Specifiers:

| Data Type | Format Specifier |
| --- | --- |
| Integer | %d |
| Character | %c |
| Float | %f |
| Double | %lf |
| String | %s |
Slide 60 of 17

<!-- Slide number: 61 -->
# Examples
Using printf( ):
int age = 20;
printf("Age is: %d", age);
Using scanf( ):
int age;
scanf("%d", &age);
&(address-of operator) is required in scanf() to store the input in variables.
Printf() doesn’t need &, as it only displays values.
Format specifiers must match the data type.

Slide 61 of 17

<!-- Slide number: 62 -->
# What is a Header File?
A header file in C contains:
Function declarations (prototypes)
Macro definitions
Constants and type definitions
They help reuse code and organize functions logically.

Slide 62 of 17

<!-- Slide number: 63 -->
# Common Header Files:
| Header File | Purpose |
| --- | --- |
| stdio.h | Input and Output functions (printf(), scanf()) |
| conio.h | Console input/output (getch(), clrscr()) |
| math.h | Math functions (sqrt(), pow()) |
| string.h | String functions (strlen(), strcpy()) |
| stdlib.h | General utilities (malloc(), exit()) |
Slide 63 of 17

<!-- Slide number: 64 -->
# How to Include Header Files?
#include <stdio.h>   // Standard header
#include "myheader.h" // Custom header
<…..> is used for standard headers.
“…..” is used for user defined headers.
Key Points:
Always include required headers at the top of the program
Prevents redundant code
Makes debugging and maintenance easier
Libraries are precompiled and speed up development

Slide 64 of 17

<!-- Slide number: 65 -->
# What is a Library File?
A library file contains the actual code (definitions) for the functions declared in header files.
A library file in C contains precompiled code of commonly used functions.These files save time and effort, allowing programmers to use tested, optimized code without rewriting it.
File extension: .lib or .a (in compiled form)
Stored in the C Standard Library
When you include a header file, the compiler knows how to use the function. During compilation,
the linker fetches the function definition from the library file.
Slide 65 of 17

<!-- Slide number: 66 -->
# Types of Library Files
There are two main types:

| Type | Extension | Description |
| --- | --- | --- |
| Static Library | .lib or .a | Code is added directly to the final executable at compile time. |
| Dynamic Library | .dll (Windows) / .so (Linux) | Code is linked at runtime, reducing executable size. |
Slide 66 of 17

<!-- Slide number: 67 -->
# How Libraries Work in C
When you use a function like printf():
The header file stdio.h tells the compiler the function exists.
During linking, the compiler looks into the library file that contains the
compiled code of printf() and links it to your program.

Slide 67 of 17

<!-- Slide number: 68 -->
# Data Type Casting
What is Type Casting?
Type casting refers to converting one data type into another.This helps in performing operations between different types or optimizing memory.

Slide 68 of 17

<!-- Slide number: 69 -->
# Types of Type Casting in C:
1. Implicit Type Casting (Automatic)
Done automatically by the compiler.
Converts smaller to larger data types.
Also called type promotion.
Example:
int a = 5;
float b = a;  // int to float automatically

Slide 69 of 17

<!-- Slide number: 70 -->
# Explicit Type Casting (Manual)
Done manually by the programmer.
Syntax: (new_type) variable;
Used when converting larger to smaller data types or for precision control.
float a = 5.75;
int b = (int) a;  // float to int => 5

Slide 70 of 17

<!-- Slide number: 71 -->
# Examples:
int x = 10;
int y = 3;
float result = (float)x / y;  // 10/3 = 3.33 instead of 3

Slide 71 of 17
