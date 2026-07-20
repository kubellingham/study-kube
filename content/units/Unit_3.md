<!-- Slide number: 1 -->
COMPUTER PROGRAMMING USING C

![E:\Workshop_powerPoint\Pictures\785_LPU.png](Picture2.jpg)
CSE22D
UNIT 3

Department of Computer Science  Engineering | School of Polytechnic | Lovely Professional University |

Slide 1 of 17

<!-- Slide number: 2 -->
# Functions:
A function is a block of code that performs a specific task.
It helps in code reusability, modularity, and makes programs easier to read and debug.
C programs start execution from the main() function.
Functions can be:
Library Functions (predefined): like printf(), scanf(), sqrt()
User-defined Functions: functions created by the programmer.

Slide 2 of 17

<!-- Slide number: 3 -->
# Syntax:
return_type function_name(parameters) {
    // function body
    return value;  // optional if return_type is void
   }

Slide 3 of 17

<!-- Slide number: 4 -->
# USES OF C FUNCTIONS
C functions are used to avoid rewriting same logic/code again and again in a program.
There is no limit in calling C functions to make use of same functionality wherever required.
A large C program can easily be tracked when it is divided into functions.
The core concept of C functions are, re-usability, dividing a big task into small pieces to achieve the functionality and to improve understandability of very large C programs.

<!-- Slide number: 5 -->
Function definition:
		return_type    function_name (arguments list)		{
			Body of function;
		}
Function call:      function_name (arguments list);

Function declaration:
		return_type function_name (argument list);

<!-- Slide number: 6 -->
# Predefined Functions

main() is a predefined function, which is used to execute code, and printf() is a function; used to output/print text to the screen:\
  void main()
 {  printf("Hello World!");    getch();  }

<!-- Slide number: 7 -->
# Create a Function

To create (often referred to as declare) your own function, specify the name of the function, followed by parentheses () and curly brackets {}:
Syntax
void myFunction() {
  // code to be executed
}

<!-- Slide number: 8 -->
# Call a Function

To call a function, write the function's name followed by two parentheses () and a semicolon ;
In the following example, myFunction() is used to print a text (the action), when it is called:
Inside main, call myFunction():

// Create a function
void myFunction() {
  printf("I just got executed!");
}

int main() {
  myFunction(); // call the function
  return 0;
}
// Outputs "I just got executed!"

<!-- Slide number: 9 -->

void myFunction() {  printf("I just got executed!");}int main() {  myFunction();  myFunction();  myFunction();  return 0;}// I just got executed!// I just got executed!// I just got executed!
Try it Yours

<!-- Slide number: 10 -->
Function Declaration (Prototype)
Tells the compiler about the function name, return type, and parameters before its use.
Declared before main().

Syntax:
return_type function_name(parameter_list);

Example:
int add(int a, int b);   // function declaration

Slide 10 of 17

<!-- Slide number: 11 -->

Function Call
Used inside main() or another function to execute the function.
The program control jumps to the function definition when called.

Syntax:
function_name(arguments);

Example:
result = add(5, 7);   // function call

Slide 11 of 17

<!-- Slide number: 12 -->
Function Definition
The actual body of the function, where the logic is written.

Syntax:
return_type function_name(parameters) {
    // function body
    return value;   // optional if return type is void
}
Example:
int add(int a, int b) {
    return a + b;
}

Slide 12 of 17

<!-- Slide number: 13 -->
# Example:
#include <stdio.h>
// 1. Function Declaration
int add(int a, int b);
int main() {
    int result;
    // 2. Function Call
    result = add(10, 20);
    printf("Sum = %d", result);
    return 0;
}
// 3. Function Definition
 int add(int a, int b) {
    return a + b;
}
Output:
Sum = 30

Slide 13 of 17

<!-- Slide number: 14 -->

#include<stdio.h>
int square ( int );        // function prototype, also called function declaration
int main( )
{
  	int m, n ;
	printf ( "\nEnter some number for finding square \n");
 	scanf ( "%d", &m ) ;
	n = square (m) ;    // function call
	printf ( "\nSquare of the given number %d is %d",m,n );
}

int square ( int  x )   // function definition
{
 	int p ;
   	p = x * x ;
	return  p;
}

<!-- Slide number: 15 -->
#
Function Declaration (Prototype):
Not always required if the definition comes before its first use.Required if the function is defined after main().
Function Definition:
Always required if you are using that function.
Must exist exactly once in the program (otherwise you’ll get linker errors).
Function Call:
Required only if you want to execute that function. If you define a function but never call it, the program still compiles, but that function does nothing.

Slide 15 of 17

<!-- Slide number: 16 -->
Local Variables
Declared inside a function or block.
Accessible only within that function/block.
Created when the function is called, destroyed when it exits.

Global Variables:
Declared outside all functions.
Accessible by all functions in the program.
Lifetime: entire program execution.

Slide 16 of 17

<!-- Slide number: 17 -->
# Local Variable:
#include <stdio.h>
void display() {
    int x = 10;  // local variable
    printf("Local x = %d\n", x);
}
int main() {
    display();
    // printf("%d", x);  // ❌ Error: x not accessible here
    return 0;
}
Output:
Local x = 10

Slide 17 of 17

<!-- Slide number: 18 -->
# Global Variable:
#include <stdio.h>
   int g = 100;  // global variable
   void show() {
   printf("Global g in show() = %d\n", g);
}
int main() {
    printf("Global g in main() = %d\n", g);
    show();
   return 0;
}
Output:
Global g in main() = 100
Global g in show() = 100

Slide 18 of 17

<!-- Slide number: 19 -->
# HOW TO CALL C FUNCTIONS IN A PROGRAM?
There are two ways that a C function can be called from a program. They are:
Call by value
Call by reference

Types of function parameters:

Actual parameter – This is the argument which is used in function call.
Formal parameter – This is the argument which is used in function definition

<!-- Slide number: 20 -->
# Call by value
In call by value method, the copy of the variable is passed to the function as parameter.
The value of the actual parameter can not be modified by formal parameter.
Different Memory is allocated for both actual and formal parameters. Because, value of actual parameter is copied to formal parameter.

<!-- Slide number: 21 -->
# With declare
void fun(int , int);
void main()
{
int x=5,y=7;
fun(x,y)
printf(“x=%d y=%d”,x,y);
}
void fun(int x,int y)
{
x=7;
y=5;
printf(“x=%d y=%d”,x,y);
}
Output: Inside fun: x=7 y=5
Inside main: x=5 y=7

Slide 21 of 17

<!-- Slide number: 22 -->
# Without declare
#include <stdio.h>

void fun(int x, int y) {
    x = 7;
    y = 5;
    printf("Inside fun: x=%d y=%d\n", x, y);
}

int main() {
    int x = 5, y = 7;
    fun(x, y);
    printf("Inside main: x=%d y=%d\n", x, y);
    return 0;
}

Slide 22 of 17

<!-- Slide number: 23 -->
#include <stdio.h>
void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
    printf("Inside swap: a = %d, b = %d\n", a, b);
}
int main() {
    int x = 5, y = 10;
    swap(x, y);  // call by value
    printf("In main: x = %d, y = %d\n", x, y);
    return 0;
}
Output:Inside swap: a = 10, b = 5
In main: x = 5, y = 10
Original values of x and y remains unchanged.

Slide 23 of 17

### Notes:

<!-- Slide number: 24 -->
# CALL BY REFERENCE
In call by reference method, the address of the variable is passed to the function as parameter.

The value of the actual parameter can be modified by formal parameter.

Same memory is used for both actual and formal parameters since only address is used by both parameters.

<!-- Slide number: 25 -->
# With declare
void fun(int *, int *);
void main()
{
int x=5,y=7;
fun(&x, &y)
printf(“x=%d y=%d”, x, y);
}
void fun(int *x, int *y)
*x=7;
*y=5;
printf(“x=%d y=%d”, *x, *y);
}
Output: Inside fun: x=7 y=5
Inside main: x=7 y=5

Slide 25 of 17

<!-- Slide number: 26 -->
# Without declare function
#include <stdio.h>

void fun(int *x, int *y) {
    *x = 7;
    *y = 5;
    printf("Inside fun: x=%d y=%d\n", *x, *y);
}

int main() {
    int x = 5, y = 7;
    fun(&x, &y);
    printf("Inside main: x=%d y=%d\n", x, y);
    return 0;
}

Slide 26 of 17

<!-- Slide number: 27 -->
#include <stdio.h>
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
    printf("Inside swap: *a = %d, *b = %d\n", *a, *b);
}
int main() {
    int x = 5, y = 10;
    swap(&x, &y);  // call by reference
    printf("In main: x = %d, y = %d\n", x, y);
    return 0;
}
Output:Inside swap: *a = 10, *b = 5
In main: x = 10, y = 5
Original values of x and y remain changed.

Slide 27 of 17

<!-- Slide number: 28 -->
# Difference Between Call by Value and Call by Reference
| Feature | Call by Value | Call by Reference |
| --- | --- | --- |
| What is passed? | Copy of variable value | Address of variable |
| Original variable | Not affected | Affected |
| Memory usage | More (extra copy created) | Less (no extra copy) |
| Use case | When original data should stay safe | When function must modify actual data |
Slide 28 of 17

<!-- Slide number: 29 -->

![C:\Users\madan lal\Downloads\pass-by-reference-vs-pass-by-value-animation.gif](Picture2.jpg)

<!-- Slide number: 30 -->
# We can define the User defined functions in multiple ways
Function with no argument and no Return value
Function with no argument and with Return value
Function with argument and No Return value
Function with argument and Return value

<!-- Slide number: 31 -->

![Passing Parameters to Functions](Picture2.jpg)
#

<!-- Slide number: 32 -->

               Function with No argument and No Return value

In this method, We won’t pass any arguments to the function while defining, declaring or calling the function. This type of functions will not return any value when we call the function from main() or any sub function. When we are not expecting any return value but, we need some statements to be printed as output then, this type of functions are very useful.
#include<stdio.h>
 void Addition();    // Function Declaration
  int main()
{
  printf("\n ............. \n");
  Addition();     // Function call
}
 void Addition()
{
  int Sum, a = 10, b = 20;
  Sum = a + b;
  printf("\n Sum of a = %d and b = %d is = %d", a, b, Sum);
}

<!-- Slide number: 33 -->
#

Function with no argument and with Return value

In this method, We won’t pass any arguments to the function while defining, declaring or calling the function.
This type of functions will return some value when we call the function from main() or any sub function.
Data Type of the return value will depend upon the return type of function declaration.
For instance, if the return type is int then return value will be int.

#include<stdio.h>
int Multiplication();
int main()
{
  int Multi;
  Multi = Multiplication();
  printf("\n Multiplication of a and b is = %d \n", Multi );
 return 0;
}
 int Multiplication()
{
  int Multi, a = 20, b = 40;
  Multi = a * b;
  return Multi;
}

<!-- Slide number: 34 -->

Function with argument and No Return value

This method allows us to pass the arguments to the function while calling the function. But, This type of functions will not return any value when we call the function from main () or any sub function.

#include<stdio.h>
int Addition(int, int);
Int main()
{
  int a, b;
 printf("\n Please Enter two integer values \n");
  scanf("%d %d",&a, &b);
  Addition(a, b);
}
 int Addition(int a, int b)
{
  int Sum;
  Sum = a + b;
 printf("\n Additiontion of %d and %d is = %d \n", a, b, Sum);
}

<!-- Slide number: 35 -->

Function with argument and Return value

This method allows us to pass the arguments to the function while calling the function. This type of functions will return some value when we call the function from main () or any sub function. Data Type of the return value will depend upon the return type of function declaration. For instance, if the return type is int then return value will be int.
#include<stdio.h>
 int Multiplication(int, int);
 int main()
{
  int a, b, Multi;
  printf("\n Please Enter two integer values \n");
  scanf("%d %d",&a, &b);
  Multi = Multiplication(a, b);
  printf("\n Multiplication of %d and %d is = %d \n", a, b, Multi);
  return 0;
}
 int Multiplication(int a, int b)
{
  int Multi;
  Multi = a * b;
  return Multi;
}

<!-- Slide number: 36 -->
# Recursion

A function that calls itself is known as a recursive function. And, this technique is known as recursion.
  In programming languages, if a program allows you to call a function inside the same function, then it is called a recursive call of the function.
Syntax:
void recursion()
{
recursion(); /* function calls itself */
}
int main()
 {
recursion();
}

<!-- Slide number: 37 -->
#

![Computer Programming Gifs–all of em' | Penjee, Learn to Code](Picture2.jpg)

<!-- Slide number: 38 -->
# Factorial n! = n × (n-1) × (n-2) × … × 1
#include <stdio.h>
int factorial(int n) {
    if (n == 0 || n == 1)  // base condition
        return 1;
    else
        return n * factorial(n - 1);  // recursive call
}

int main() {
    int num = 5;
    printf("Factorial of %d = %d", num, factorial(num));
    return 0;
}
Output:Factorial of 5 = 120

Slide 38 of 17

<!-- Slide number: 39 -->
# Fibonacci using Recursion
#include <stdio.h>
int fibonacci(int n) {
    if (n == 0)  // base case
        return 0;
    else if (n == 1)
        return 1;
    else
        return fibonacci(n - 1) + fibonacci(n - 2); // recursive call
}
int main() {
    int i, n = 7;
    printf("Fibonacci series up to %d terms:\n", n);
    for (i = 0; i < n; i++) {
        printf("%d ", fibonacci(i));
    }
    return 0;
}
Output: Fibonacci series up to 7 terms:
0 1 1 2 3 5 8

Slide 39 of 17

<!-- Slide number: 40 -->

Advantages & Disadvantages of Recursion

Advantage
Recursion makes program elegant and cleaner. All algorithms can be defined recursively which makes it easier to visualize and prove.
Reduce unnecessary calling of function.

Disadvantage
If the speed of the program is vital then, you should avoid using recursion. Recursions use more memory and are generally slow. Instead, you can use loop.
programmers need to be careful to define an exit condition from the function, otherwise it will go into an infinite loop.
Recursive solution is always logical and it is very difficult to trace.(debug and understand).
In recursive we must have an if statement somewhere to force the function to return without the recursive call being executed, otherwise the function will never return.
Recursion takes a lot of stack space, usually not considerable when the program is small and running on a PC.
Recursion uses more processor time
