<!-- Slide number: 1 -->
COMPUTER PROGRAMMING USING C

![E:\Workshop_powerPoint\Pictures\785_LPU.png](Picture2.jpg)
CSE22D
UNIT 4

Department of Computer Science  Engineering | School of Polytechnic | Lovely Professional University |

Slide 1 of 17

<!-- Slide number: 2 -->
# UNIT 4

ARRAYS
Slide 2 of 17

### Notes:

<!-- Slide number: 3 -->
# Introduction to Arrays in C
An array in C is a collection of elements of the same data type stored in contiguous memory locations. Each element can be accessed using an index number, starting from 0.
The values held in an array are called array elements
An array stores multiple values of the same type – the element type
     we can create an array of integers, an array of characters, an array of String objects, etc.

Slide 3 of 17

<!-- Slide number: 4 -->
# Need for Arrays
Without arrays, if we want to store multiple values, we would need to declare separate variables:
int a1, a2, a3, a4, a5;
This becomes difficult to manage when the number of elements increases.Arrays make it easier:
int a[5];
Here, a can hold 5 integer values.
Slide 4 of 17

<!-- Slide number: 5 -->
# Arrays
An array is an ordered list of values
Each value has a numeric index

The entire array
has a single name

scores
0     1     2     3     4     5     6     7     8     9

79   87   94   82   67   98   87   81   74   91
An array of size N is indexed from zero to N-1
This array holds 10 values that are indexed from 0 to 9

<!-- Slide number: 6 -->
# Arrays
A particular value in an array is referenced using the array name followed by the index in brackets
For example, the expression
scores[2]
	refers to the value 94 (the 3rd value in the array)
That expression represents a place to store a single integer and can be used wherever an integer variable can be used

<!-- Slide number: 7 -->
# Array Applications
Given a list of test scores, determine the maximum and minimum scores.
Read in a list of student names and rearrange them in alphabetical order (sorting).
Given the height measurements of students in a class, output the names of those students who are taller than average.

![j0199365](Picture7.jpg)

<!-- Slide number: 8 -->
# Syntax
data_type array_name[size];
Example:
int marks[5];
float prices[10];
char name[20];

Slide 8 of 17

<!-- Slide number: 9 -->
# Array Declaration
An array declaration tells the compiler to reserve space in memory for a collection of elements of the same data type.
Syntax:
data_type array_name[size];
Example:
int marks[5];        // Array of 5 integers
float price[10];     // Array of 10 float values
char grade[3];       // Array of 3 characters
data_type : type of elements (int, float, char, etc.)
array_name: user-defined name for the array
Size: number of elements the array can hold (must be a positive integer constant)

Slide 9 of 17

<!-- Slide number: 10 -->

Initialization:
Arrays can be initialized at declaration time:

int age[5]={22,25,30,32,35};

A Pictorial Representation of the Array:

![One-Dimensional-array](Picture2.jpg)

<!-- Slide number: 11 -->
# Array InitializationYou can assign values to an array while declaring it.Example 1: Complete Initializationint marks[5] = {85, 90, 75, 80, 95};Example 2: Partial Initializationint marks[5] = {85, 90};Remaining elements will automatically be set to 0.Example 3: Automatic Size Detectionint marks[] = {85, 90, 75, 80, 95};Here, the compiler automatically counts 5 elements and sets the array size accordingly.
Slide 11 of 17

<!-- Slide number: 12 -->
# Accessing Array Elements
Each element is accessed using its index:
marks[0] = 80;
printf("%d", marks[2]);
Here, marks[0] refers to the first element, marks[2] refers to the third element.
Slide 12 of 17

<!-- Slide number: 13 -->
# Example Program
#include <stdio.h>
int main() {
    int numbers[5] = {10, 20, 30, 40, 50};
    for(int i = 0; i < 5; i++) {
        printf("Element %d = %d\n", i, numbers[i]);
    }
    return 0;
}

OUTPUT:
Element 0 = 10
Element 1 = 20
Element 2 = 30
Element 3 = 40
Element 4 = 50

Slide 13 of 17

<!-- Slide number: 14 -->

# How to insert and print array elements?int mark[5] = {19, 10, 8, 17, 9} // insert different value to third element mark[3] = 9; // take input from the user and insert in third element scanf("%d", &mark[2]); // take input from the user and insert in (i+1)th element scanf("%d", &mark[i]); // print first element of an array printf("%d", mark[0]);// print first element of an array printf("%d", mark[0]); // print ith element of an array printf("%d", mark[i-1]);

<!-- Slide number: 15 -->
# Length of an Array
The length (or size) of an array refers to the number of elements it can store.
Formula to find array length:
length = sizeof(array_name) / sizeof(array_name[0]);
Example:
#include <stdio.h>
int main() {
    int numbers[] = {10, 20, 30, 40, 50};
    int length = sizeof(numbers) / sizeof(numbers[0]);
    printf("Length of the array = %d\n", length);
    return 0;
}
OUTPUT: Length of the array = 5

Slide 15 of 17

<!-- Slide number: 16 -->
#
sizeof(array_name)→ Gives the total memory (in bytes) occupied by the entire array.
sizeof(array_name[0])→ Gives the memory size (in bytes) of a single element of the array.
Dividing them→ total size of array ÷ size of one elementgives the number of elements (length) in the array.
Let’s analyze:
The array has 5 elements: {10, 20, 30, 40, 50}
Each element is of type int.
Assume on your system: sizeof(int) = 4 bytes

Slide 16 of 17

<!-- Slide number: 17 -->
#
Then:
sizeof(numbers) = total size of array = 5 * 4 = 20 bytes
sizeof(numbers[0]) = size of one element = 4 bytes
So:
length = sizeof(numbers) / sizeof(numbers[0])
length = 20 / 4 = 5
Output:
Length of the array = 5

Slide 17 of 17

<!-- Slide number: 18 -->
# Single-Dimensional Array
A single-dimensional array (1D array) is a list of elements of the same data type stored sequentially in memory.It is like a row of values.
SYNTAX:
data_type array_name[size];
Example:
int marks[5] = {85, 90, 75, 80, 95};
Marks: array name
5: size(number of elements)
marks(0) to marks(4): elements
Slide 18 of 17

<!-- Slide number: 19 -->
Accessing Elements:
printf("%d", marks[2]); // prints 75
Example:
#include <stdio.h>
int main() {
    int marks[5] = {85, 90, 75, 80, 95};
    for(int i = 0; i < 5; i++) {
        printf("marks[%d] = %d\n", i, marks[i]);
    }
    return 0;
}
OUTPUT: marks[0] = 85
marks[1] = 90
marks[2] = 75
marks[3] = 80
marks[4] = 95

Slide 19 of 17

<!-- Slide number: 20 -->
# Multidimensional Array
A multidimensional array is an array of arrays.The most common type is a two-dimensional (2D) array, used to represent tables or matrices.
Syntax:
data_type array_name[rows][columns];
Example:
int matrix[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};
Here 2: number of rows
3: number of columns
Total elements: 2*3=6

Slide 20 of 17

<!-- Slide number: 21 -->
# Accessing Elements:
printf("%d", matrix[1][2]); // prints 6 (2nd row, 3rd column)
Example:
#include <stdio.h>
int main() {
    int matrix[2][3] = {{1, 2, 3}, {4, 5, 6}};

    for(int i = 0; i < 2; i++) {
        for(int j = 0; j < 3; j++) {
            printf("%d ", matrix[i][j]);
        }
        printf("\n");
    }
    return 0;
}
OUTPUT:1 2 3
4 5 6

Slide 21 of 17

<!-- Slide number: 22 -->
# Arrays of Characters in C
An array of characters is commonly used in C to store a string — a sequence of characters ending with a null character '\0'.
In simple words,A string in C = character array terminated by '\0'

Slide 22 of 17

<!-- Slide number: 23 -->
# Declaration of Character Array
Syntax:
char array_name[size];
Examples:
char name[10];
char word[6] = {'H', 'e', 'l', 'l', 'o', '\0'};
The null character ('\0’) marks the end of the string.
Without ('\0’), the compiler won’t know where the string ends.

Slide 23 of 17

<!-- Slide number: 24 -->
# Initialization of Character Array
You can initialize character arrays in two ways:
(a) Using individual characters:
char name[5] = {'R', 'A', 'M', 'A', '\0'};
(b) Using string literal:
char name[] = "RAMA";
Note: When you use double quotes (" "), the compiler automatically adds the null character '\0' at the end of the string.

Slide 24 of 17

<!-- Slide number: 25 -->
# Accessing Elements of a Character Array
Each character is accessed using its index (starting from 0).
Example:
#include <stdio.h>
int main() {
    char name[] = "RAMA";
    printf("First character: %c\n", name[0]);
    printf("Third character: %c\n", name[2]);
    return 0;
}
Output:
First character: R
Third character: M

Slide 25 of 17

<!-- Slide number: 26 -->
# Reading and Displaying Character Arrays
Input and Output using scanf() and printf():
#include <stdio.h>
int main() {
    char name[20];
    printf("Enter your name: ");
    scanf("%s", name);      // reads a word (no spaces)
    printf("Hello %s\n", name);
    return 0;
}
Output:
Enter your name: Manpreet
Hello Manpreet
 scanf() stops reading at the first space. For full sentences, use gets() or fgets().

Slide 26 of 17

<!-- Slide number: 27 -->
# Reading Strings with Spaces
Use fgets() to read a full line including spaces:
#include <stdio.h>
int main() {
    char message[50];
    printf("Enter a message: ");
    fgets(message, sizeof(message), stdin);
    printf("You entered: %s", message);
    return 0;
}

Slide 27 of 17

<!-- Slide number: 28 -->
# Explanation:
The program declares a character array message that can store up to 49 characters plus one null character ('\0').
fgets() is used to read a line of text (including spaces) from the user.
It automatically stops reading when:
The Enter key is pressed (\n encountered), or
The buffer limit (50 characters here) is reached.
The input string is then printed using printf().
 Run:
Input:
Enter a message: Welcome to C Programming
Output:
You entered: Welcome to C Programming

Slide 28 of 17

<!-- Slide number: 29 -->
# String as Array Example
#include <stdio.h>
int main() {
    char str[] = "C PROGRAM";
    int i;

    for(i = 0; str[i] != '\0'; i++) {
        printf("%c ", str[i]);
    }

    return 0;
}
OUTPUT: C   P   R   O   G   R   A   M

Slide 29 of 17

<!-- Slide number: 30 -->
# Important Points
A string in C is a null-terminated character array.
'\0' marks the end of the string.
Character arrays can be manipulated using string functions like:
strlen() – find string length
strcpy() – copy one string to another
strcat() – concatenate strings
strcmp() – compare two strings
(These are defined in the <string.h> library.)

Slide 30 of 17

<!-- Slide number: 31 -->
# String Functions
#include <stdio.h>
#include <string.h>
int main() {
    char s1[20] = "Hello";
    char s2[20] = "World";

    strcat(s1, s2); // joins s2 to s1
    printf("Concatenated String: %s\n", s1);
    printf("Length: %lu\n", strlen(s1));
    return 0;
}
OUTPUT: Concatenated String: HelloWorld
Length: 10

Slide 31 of 17

<!-- Slide number: 32 -->
# String Functions
| Function | Purpose | Example |
| --- | --- | --- |
| strlen(str) | Returns length of string | "Hello" → 5 |
| strcpy(dest, src) | Copies one string to another | strcpy(str3, str1) |
| strcat(str1, str2) | Appends str2 to end of str1 | "Hello" + "World" = "HelloWorld" |
| strcmp(str1, str2) | Compares two strings | Returns 0, <0, or >0 |
| strrev(str) | Reverses the string | "World" → "dlroW" |
| strlwr(str) | Converts to lowercase | "HELLO" → "hello" |
| strupr(str) | Converts to uppercase | "hello" → "HELLO" |
Slide 32 of 17

<!-- Slide number: 33 -->
# Passing an Array to a Function
In C, when you pass an array to a function, you actually pass the address of the first element of the array — not the whole array.This means any changes made to the array elements inside the function will affect the original array.
 2. Syntax
function_name(array_name, size);
Function definition:
void function_name(int arr[], int n) {
    // function body
}
or equivalently,
void function_name(int *arr, int n);
Both forms are valid — because arrays are passed by reference in C.

Slide 33 of 17

<!-- Slide number: 34 -->
# Displaying Array Elements

![](Picture5.jpg)

Slide 34 of 17

<!-- Slide number: 35 -->
# Modifying Array Elements Inside Function
#include <stdio.h>
// Function to modify array elements
void modify(int arr[], int n) {
    int i;
    for(i = 0; i < n; i++) {
        arr[i] = arr[i] * 2;  // double each element
    }}
int main() {
    int data[] = {1, 2, 3, 4, 5};
    int size = sizeof(data) / sizeof(data[0]);
    modify(data, size);  // pass array
    printf("Modified array: ");
    for(int i = 0; i < size; i++) {
        printf("%d ", data[i]);
    }
    printf("\n");
    return 0;
}

Slide 35 of 17
