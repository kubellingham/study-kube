<!-- Slide number: 1 -->
COMPUTER PROGRAMMING USING C

![E:\Workshop_powerPoint\Pictures\785_LPU.png](Picture2.jpg)
CSE22D
UNIT 2

Department of Computer Science  Engineering | School of Polytechnic | Lovely Professional University |

Slide 1 of 17

<!-- Slide number: 2 -->
# Outline
Control structure
Decision Statements
If statement
If-else statement
Switch statement

<!-- Slide number: 3 -->
# Program
Program is a set of instruction executed one by one.

Depending upon the circumstances sometimes it is desirable to alter the sequence of execution of statements.

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)
1. Wake up;
2. Get ready;
3. If you have enough time, then eat breakfast;
4. Go to school.

### Notes:

<!-- Slide number: 4 -->
# Control Statements
The C language programs until now follows a sequential form of execution of statements.
 C language provides statements that can alter the flow of a sequence of instructions. These statements are called control statements.
 These statements help to jump from one part of the program to another. The control transfer may be conditional or unconditional.

<!-- Slide number: 5 -->
# Control Structure

A control structure refers to the way in which the programmer specifies the order of executing the statements.
Three control structures
Sequence structure: all statements are executed in the order as it is written
Programs are executed sequentially by default.
Selection structures: Different sets of statements are executed based on one or more conditions

if, if…else, switch
Repetition structures (iteration): Certain set of statements are executed repeatedly
while, do…while, for

### Notes:
Sequence- all statements are executed in the order as it is written
Selection- Different sets of statements are executed based on one or more conditions
Iteration- Certain set of statements are executed repeatedly

<!-- Slide number: 6 -->
# Condition Statements
The C condition statements or the decision statements, checks the given condition
Based upon the state of the condition, a sub-block is executed.
Decision statements are the:
if statement
if-else statement
switch statement

<!-- Slide number: 7 -->

# Daily routine
Start

Go!!!
Where
To
Go?
Class
Movie

![http://vecto.rs/1024/vector-of-a-happy-cartoon-summer-man-walking-with-a-big-smile-by-ron-leishman-27463.jpg](Picture4.jpg)

![http://toonclips.com/600/6709.jpg](Picture2.jpg)
Stop
Stop

<!-- Slide number: 8 -->
# if statement

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)
If you have time?
Yes
No

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

<!-- Slide number: 9 -->
# if Statement
If statement
It is decision making statement uses keyword if.
It allows the computer to evaluate the expression first
 and then, depending on whether the value is ‘true’ or ‘false’, i.e. non zero or zero it transfers the control to a particular statement.

A decision can be made on any expression.
zero - false
nonzero - true
Example:
3 < 4 is true

<!-- Slide number: 10 -->
# if Statement

Syntax

	if (expression)
 	 statement;

or

	if (expression)
	 {
	   block of statements;
	 }

![Branching in C programming language using if statement](Picture2.jpg)

<!-- Slide number: 11 -->
# if Statement
                            The if statement has the following syntax:

The condition must be a
boolean expression. It must
Evaluate to either non-zero or zero.

if is a C
reserved word

if ( condition )/* no semi-colon */
   statement;

If the condition is true, the statement is executed.
If it is false, the statement is skipped.

<!-- Slide number: 12 -->
# Rain ???
Is it going to rain?

Look up sky for clouds
yes
Clouds?
no

![clear sky.jpg](Picture32.jpg)

![rain3.jpg](Picture25.jpg)
No rain
Raining

<!-- Slide number: 13 -->
#include<stdio.h>
void main()
{
 int v;
 printf(“Enter the number :”);
 scanf(“%d”, &v);
 if(v<10)
   printf(“number is less  than 10”);
}
# Program to check whether number is less than 10.
Enter the number: 6
Number is less than 10

<!-- Slide number: 14 -->
| #include <stdio.h> void main() { int number; printf("Enter an integer: "); scanf("%d", &number); // Test expression is true if number is less than 0 if (number < 0) { printf("You entered %d.\n", number); } printf("The if statement is easy."); getch(); } |
| --- |
#

<!-- Slide number: 15 -->
# Control Flow

![](Picture2.jpg)

<!-- Slide number: 16 -->
# if..else statement

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)
If you have time?
Yes
No

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)
Grab something to eat along

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

<!-- Slide number: 17 -->
# if..else statement
The if statement executes only when the condition following if is true.
It does nothing when the condition is false.
The if..else statement takes care of the true and false conditions.

<!-- Slide number: 18 -->
# if..else statement
if..else has two blocks.
One block is for if and it is executed when condition is non-zero(true).
The other block is of else and its executed when condition is zero (false).

![Flowchart of if...else statement in C Programming](Picture2.jpg)
	if (expression)
 	 {
 	   block of statements;
 	 }
	else
  	{
   	  block of statements;
 	 }
Syntax

<!-- Slide number: 19 -->
# if..else statement
The else statement cannot be used without if.
No multiple else statements are allowed with one if.
else statement has no expression.
Number of else cannot be greater than number of if.

<!-- Slide number: 20 -->
# Example
#include<stdio.h>
void main( )
   {
    int a;
    printf("n Enter a number:");
    scanf("%d", &a);
    if(a>0)
     {
      printf( "n The number %d is positive.",a);
     }
    else
     {
      printf("n The number %d is negative.",a);
     }
  getch();

   }

<!-- Slide number: 21 -->
# Ternary conditional operator (?:)
C code:
if ( marks>= 60 )
   printf( "Pass\n");
else
   printf( "Fail\n");
Same code using ternary operator:
Takes three arguments (condition, value if true, value if false)
Our code could be written:
printf("%s\n", grade >= 60 ? "Pass" : "Fail");
Or it could have been written:
grade >= 60 ? printf(“Pass\n”) : printf(“Fail\n”);

<!-- Slide number: 22 -->
#include<stdio.h>
void main()
{
 int a;
 printf(“Enter the number :”);
 scanf(“%d”, &v);
 if(v<10)
   printf(“number is less than 10”);
 else
   printf(“number is greater than 10”);
}
# Example : Program to check whether number is less than 10.
Enter the number: 7
Number is less than 10
or
Enter the number: 100
Number is greater than 10

<!-- Slide number: 23 -->
# Control Flow

![](Picture2.jpg)
MESSAGE
DISPLAY

<!-- Slide number: 24 -->
# Control Flow

![](Picture2.jpg)
MESSAGE
DISPLAY

<!-- Slide number: 25 -->
# Nested if..else
A nested if is an if statement that is the target of another if statement.
Nested if statements means an if statement inside another if statement.
 C allows us to nest if statements within if statements. i.e, we can place an if statement inside another if statement.

<!-- Slide number: 26 -->
# Nested If

Syntax
if (condition1)
{
// Executes when condition1 is true
    if (condition2)
        {
            // Executes when condition2 is true }
}

<!-- Slide number: 27 -->

![C:\Users\madan lal\Downloads\NESTED-IF-FLOW-CHART.jpg](Picture2.jpg)
#

<!-- Slide number: 28 -->
| #include<stdio.h> void main() { int a=10; clrscr(); if(a>5) { if(a>8) { printf("A is greater than 5 and 8"); } else { printf("Greater than 5 but less than 8"); } } else { printf("not less than 10"); } getch(); } |
| --- |

<!-- Slide number: 29 -->
# Forms of if
 The if statement can take any of the following forms:
 if ( condition )
	do this ;
or
 if ( condition ) {
	do this ;
	and this ;
	}
 if  ( condition ) {
	do this ;
	and this ;
	}
  else {
	do this ;
	and this ;
	}
 if ( condition )
	do this ;
   else
	do this ;
if ( condition )
     do this ;
else if ( condition )
     do this ;
else {
       do this ;
       and this ;
     }

<!-- Slide number: 30 -->
# Else if ladder

user can decide among multiple options.
The if statements are executed from the top down.
As soon as one of the conditions controlling the if is true, the statement associated with that if is executed, and the rest of the ladder is bypassed.
 If none of the conditions is true, then the final else statement will be executed.
Syntax
if (condition)
statement;
 else if (condition)
 statement; . .
else statement;

### Notes:

<!-- Slide number: 31 -->

![](Picture2.jpg)

<!-- Slide number: 32 -->
#include<stdio.h>
void main()
{
 float marks;
 scanf(“%f”, &marks);
 if (marks>90){
 	   printf(“Grade A”);
 	 }
 else  if (marks>80) {
	    printf(“Grade B”);
      }
 else  if(marks>70){
       printf(“Grade C”);
      }
 else if (marks >60) {
       printf(“Grade D”);
      }
}
# Program to print grades of students marks.
66.70
Grade D
or
78.00
Grade C

<!-- Slide number: 33 -->
| Program to relate two integers using =, > or < #include <stdio.h> void main() { int number1, number2; printf("Enter two integers: "); scanf("%d %d", &number1, &number2); //checks if two integers are equal. if(number1 == number2) { printf("Result: %d = %d",number1,number2); } | //checks if number1 is greater than number2. else if (number1 > number2) { printf("Result: %d > %d", number1, number2); } // if both test expression is false else { printf("Result: %d < %d",number1, number2); } getch(); } |
| --- | --- |
#

<!-- Slide number: 34 -->
# Forms of if
| Decision control statements | Syntax | Description |
| --- | --- | --- |
| if | if (condition){ Statements;} | In these type of statements, if condition is true, then respective block of code is executed. |
| if…else | if (condition){  Statement1; Statement2;}else {  Statement3;  Statement4;} | In these type of statements, group of statements are executed when condition is true.  If condition is false, then else part statements are executed. |
| else if ladder | if (condition1){  Statement1;}else if(condition2){  Statement2;}else  Statement 3; | If condition 1 is false, then condition 2 is checked and statements are executed if it is true. If condition 2 also gets failure, then else part is executed. |

<!-- Slide number: 35 -->
# break statement
break is a keyword.
break allows the programmer to terminate the loop.
A break statement causes control to transfer to the first statement after the loop or block.
The break statement can be used in nested loops. If we use break in the innermost loop then the control of the program is terminated only from the innermost loop.

<!-- Slide number: 36 -->

Break statement are used for terminates any type of loop e.g, while loop, do while loop or for loop or switch statements. The break statement terminates the loop body immediately and passes control to the next statement after the loop. In case of inner loops, it terminates the control of inner loop only.

<!-- Slide number: 37 -->

Use break statement
Break statement are mainly used with loop and switch statement. often use the break statement with the if statement.
with loop statement
with switch case
with if statement

<!-- Slide number: 38 -->

![](Picture2.jpg)
#

<!-- Slide number: 39 -->
# How break works

![](Picture2.jpg)

<!-- Slide number: 40 -->
# switch Statement

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)
Day= Monday
Day= Sunday
No
Yes

![http://classroomclipart.com/images/gallery/Clipart/Sports/Soccer_Clipart/soccer_sports_32813.jpg](Picture2.jpg)

![C:\Users\Aman\Pictures\C ppt pictures\Capture.JPG](Picture1.jpg)

<!-- Slide number: 41 -->
# switch Statement
The control statement that allows to make a decision from the number of choices is called switch.
Also called switch-case-default.
The switch statement provides another way to decide which statement to execute next.
The switch statement evaluates an expression, then attempts to match the result to one of several possible cases.
Each case contains a value and a list of statements.
The flow of control transfers to statement associated with the first case value that matches.

<!-- Slide number: 42 -->
# switch Statement
switch (expression)
{
case constant1:
	statements;
	break;
case constant2:
	 statements;
	break;
case constant3:
	 statements;
	break;
default:
	 statements;
}
Syntax

![](Picture2.jpg)

<!-- Slide number: 43 -->
# Rules of using switch case
Case label must be unique
Case label must end with colon
Case label must have constant expression
Case label must be of integer, character type like case 2, case 1+1, case ‘a’
Case label should not be floating point
Default can be placed anywhere in switch
Multiple cases cannot use same expression
Relational operators are not allowed in switch
Nesting of switch is allowed.
Variables are not allowed in switch case label..

<!-- Slide number: 44 -->

![](Picture8.jpg)
#

<!-- Slide number: 45 -->
# Syntax error in switch statement

Variable cannot be used as label
switch(pt){
     case count:
      printf(“%d”, count);
      break;
     case 1<8:
      printf(“A point”);
      break;
     case 2.5:
      printf(“A line”);
      break;
     case 3 + 7.7:
      printf(“A triangle”);
     case 3 + 7.7:
      printf(“A triangle”);
      break;
     case count+5:
      printf(“A pentagon”);
      break;
}

Relational operators are not allowed

Floating point number cannot be used

Floating point number cannot be used and same expression cannot be used

constant expression should be used

<!-- Slide number: 46 -->
#include<stdio.h>
void main()
{
   int pt;
   printf(“Enter the number of nodes:”);
   scanf(“%d”, &pt);
   switch(pt){
     case 0:
      printf(“\nNo Geometry”);
     break;
     case 1:
      printf(“\nA point”);
     break;
     case 2:
      printf(“\nA line”);
     break;
     case 3:
      printf(“\nA triangle”);
     break;
     case 4:
      printf(“\nA rectangle”);
     break;
     case 5:
      printf(“\nA pentagon”);
     break;
    default:
     printf(“Invalid input”);
    }
}
Program to show switch statement in geometry
Enter the number of nodes: 2
A line

### Notes:

<!-- Slide number: 47 -->
| #include<stdio.h> void main( ) { int day; printf("nEnter the number of the day:"); scanf("%d",&day); switch(day) { case 1: printf("Sunday"); break; case 2: printf("Monday"); break; case 3: printf("Tuesday"); break; | case 4: printf("Wednesday"); break; case 5: printf("Thursday"); break; case 6: printf("Friday"); break; case 7: printf("Saturday"); break; default: printf("Invalid choice"); } return 0; } |
| --- | --- |

<!-- Slide number: 48 -->
# Looping statements
Looping statement are the statements execute one or more statement repeatedly several number of times. In C programming language there are three types of loops; while, for and do-while.

<!-- Slide number: 49 -->

Why use loop ?
When you need to execute a block of code several number of times then you need to use looping concept in C language.
Advantage with looping statement
Reduce length of Code
Take less memory space.
Burden on the developer is reducing.
Time consuming process to execute the program is reduced.

<!-- Slide number: 50 -->

Types of Loops.
There are three type of Loops available in 'C' programming language.
while loop
for loop
do..while
Difference between conditional and looping statement
Conditional statement executes only once in the program where as looping statements executes repeatedly several number of time.

<!-- Slide number: 51 -->
# While loop

In while loop First check the condition if condition is true then control goes inside the loop body other wise goes outside the body. while loop will be repeats in clock wise direction.

<!-- Slide number: 52 -->
# How while loop works?

The while loop evaluates the test expression.
If the test expression is true (nonzero), codes inside the body of while loop are exectued. The test expression is evaluated again. The process goes on until the test expression is false.
When the test expression is false, the while loop is terminated.

<!-- Slide number: 53 -->

![](Picture3.jpg)
while (expression)
{
Statement 1;
Statement 2;
……………
Statement n;
}

<!-- Slide number: 54 -->
# Example…
void   main()
{
int i;
clrscr();
i= 1;
while(i<=5)
{
printf(“%d\n”,i);
i++;
}
getch();
}

<!-- Slide number: 55 -->
# Do-While
In this case the loop condition is tested at the end of the body of the loop. Hence the loop is executed at least one. The do-while loop is an unpopular area of the language, most programmers’ tries to use the straight while if it is possible.

<!-- Slide number: 56 -->
#

![](Picture2.jpg)

<!-- Slide number: 57 -->
| do { Statement 1; Statement 2; …………… Statement n; } while(expression); | #include<stdio.h> #include<conio.h> int main() { int  i; clrscr(); i=1; do { printf(“%d\n”,i); i++; }   while(i<5); getch(); return 0; } |
| --- | --- |
#

<!-- Slide number: 58 -->
# For loop
For loop is a statement which allows code to be repeatedly executed. For loop contains 3 parts Initialization, Condition and Increment or Decrements.

![](Picture2.jpg)

<!-- Slide number: 59 -->
# How for loop works?

The initialization statement is executed only once.
Then, the test expression is evaluated. If the test expression is false (0), for loop is terminated. But if the test expression is true (nonzero), codes inside the body of for loop is executed and the update expression is updated.
This process repeats until the test expression is false.

<!-- Slide number: 60 -->
#
for (initialization, condition, step)
{
Statement 1;
Statement 2;
……………
Statement n;
}

<!-- Slide number: 61 -->
# The for Statement in C

The syntax of for statement in C:

for(initialization; condition; update)
{
    // loop body (statements to execute repeatedly)
}

Initialization: executed once before the loop starts(eg. Int i=0).
Condition: evaluated before each iteration,if true loop executes,if false loop stops.
Update: executed after each iteration(eg. i++)

### Notes:

<!-- Slide number: 62 -->

![Flowchart of for loop in C programming language](Picture6.jpg)

<!-- Slide number: 63 -->
#

![AAEMZJI0](ContentPlaceholder3.jpg)

<!-- Slide number: 64 -->
| calculate the sum of first n natural numbers |
| --- |
| #include <stdio.h> void main() { int num, count, sum = 0; printf("Enter a positive integer: "); scanf("%d", &num); // for loop terminates when n is less than count for(count = 1; count <= num; ++count) { sum += count; } printf("Sum = %d", sum); getch(); } |
#

<!-- Slide number: 65 -->
# Nested Loops

Nested loops consist of an outer loop with one or more inner loops.
Eg:
		for (i=1;i<=100;i++){
			for(j=1;j<=50;j++){
				…
			}
		}
The above loop will run for 100*50 iterations.
Outer loop

Inner loop

### Notes:

<!-- Slide number: 66 -->
#include<stdio.h>
void main()
{
 int i,j,k ;
 printf(“Enter a number:”);
 scanf(“%d”, &k);
 printf(“the tables from 1 to %d: \n”,k);
 for(i=1; i<k; i++){
   for(j=1; j<=10; j++){
     printf(“%d ”,i*j);
    } //end inner for loop
   printf(“\n”);
 } //end outer for loop
getch();
} //end main
# Program to print tables up to a given number.
Enter a number
4
The tables from 1 to 4
1 2 3 4 5 6 7 8 9 10
2 4 6 8 10 12 14 16 18 20
3 6 9 12 15 18 21 24 27 30
4 8 12 16 20 24 28 32 36 40

### Notes:
K =100
Number: 1 cube: 1
Number:2 cube: 8
Number: 3 cube: 27
Number: 4 cube: 64

<!-- Slide number: 67 -->
#include<stdio.h>
#include<conio.h>
void main()
{
 int i,j;
 printf(“Displaying right angled triangle for 5 rows”);
 for(i=1 ; i<=5 ; i++) {
   for(j=1 ; j<=i ; j++)
   	printf(“* ”);
   printf(“\n”);
 }
}
# Program to display a pattern.
Displaying right angled triangle for 5 rows
*
* *
* * *
* * * *
* * * * *

### Notes:

<!-- Slide number: 68 -->
# Difference between while and do..while
| while loop | do..while loop |
| --- | --- |
| 1. Condition is specified at the top | 1. Condition is mentioned at the bottom |
| 2. Body statements are executed when the condition is satisfied | 2. Body statements are executed at least once even if the expression value evaluates to false |
| 3. It is an entry controlled loop | 3. It is an exit controlled loop |
| 4.Syntax: while (condition) statement; | 4.Syntax: do {statements; }while (condition); |

<!-- Slide number: 69 -->
# Jump statements
You have learn that, the repetition of a loop is controlled by the loop condition.
C provides another way to control the loop, by using jump statements.
There are four jump statements:

![](Picture6.jpg)

<!-- Slide number: 70 -->
# Continue statement

Continue statement is a jump statement. The continue statement can be used only inside for loop, while loop and do-while loop.
Execution of these statement does not cause an exit from the loop but it suspend the execution of the loop for that iteration and transfer control back to the loop for the next iteration.
Syntax:
     continue;

<!-- Slide number: 71 -->
# continue statement
In while and do…while loops, the continue statement transfers the control to the loop condition.
In for loop, the continue statement transfers the control to the updating part.

![](Picture6.jpg)

<!-- Slide number: 72 -->

![C Continue Statement](Picture2.jpg)

<!-- Slide number: 73 -->
# continue statement
#include<stdio.h>
int main()
{
 int n;
 for (n=10; n>0; n=n-1){
  if (n%2==1)
     continue;
   printf(“%d ”, n);
 }
}

Program to show the use of continue statement in for loop

10 8 6 4 2

<!-- Slide number: 74 -->
# Using for loop

![](Picture4.jpg)

<!-- Slide number: 75 -->
# Using While Loop

![](Picture2.jpg)

<!-- Slide number: 76 -->
# goto
Unconditionally transfer control.
goto may be used for transferring control from one place to another.
The syntax is:
	 goto identifier;
Control is unconditionally transferred to the location of a local label specified by identifier. For example,
	Again:
	...
	goto Again;

### Notes:

<!-- Slide number: 77 -->
#
Defining a label
Label is defined following by the given syntax

label_name:
label_name should be a valid identifier name.
: (colon) should be used after the label_name.

<!-- Slide number: 78 -->
# Two styles of ‘goto’ statement
We can use goto statement to transfer program’s control from down to top (↑) and top to down (↓).

<!-- Slide number: 79 -->

Style 1 (Transferring the control from down to top)
label-name:
    statement1;
    statement2;
    ..
    if(any-test-condition)
        goto label-name;

<!-- Slide number: 80 -->
# Down to top

![](Picture2.jpg)

### Notes:

<!-- Slide number: 81 -->
# Style 2 (Transferring the control from top to down)
// style 2
statements;
    if(any-test-condition)
        goto label-name;
    statement1;
    statement2;
    label-name:
        Other statements;

<!-- Slide number: 82 -->
#

![](Picture2.jpg)

<!-- Slide number: 83 -->
# goto statement
 n=10;

A:
   printf(“%d “, n);
   n = n -1;

   if (n>0)
	 goto A;

Output:

10 9 8 7 6 5 4 3 2 1

<!-- Slide number: 84 -->
#include<stdio.h>
void main()
{
 int x;
 printf(“enter a number: ”);
 scanf(“%d”,&x);
 if(x%2==0)
 	goto even;
 else
	goto odd;
 even:
   printf(“ %d is even”, x);
   return;
 odd:
   printf(“%d is odd”, x);
}
# Program to show goto statement.
enter a number: 18
18 is even

<!-- Slide number: 85 -->
# return statement
Exits the function.
return exits immediately from the currently executing function to the calling routine, optionally returning a value. The syntax is:
return [expression];
For example,
    	int sqr (int x){
	      return (x*x);
	 }

<!-- Slide number: 86 -->

![](Picture4.jpg)

<!-- Slide number: 87 -->
# working

![](Picture4.jpg)

<!-- Slide number: 88 -->
# Points to remember
for(;;)--- Infinite loop
It is so important to remember that missing condition makes a loop as infinite loop because for loop treats no condition as true.
#include<stdio.h>
int main()
{
int i;
for(i=1;i<=5;)
 printf("\t%d",i++);
return 0;
}

<!-- Slide number: 89 -->

#include<stdio.h>
int main()
{
int sum=0,i=1;
for(;i<=5;i++)
    sum=sum+i;
printf("Sum of natural numbers from 1 to 5: %d",sum);
return 0;
}

<!-- Slide number: 90 -->

#include<stdio.h>
int main()
{
int i;
for(i=1;;i++)
  printf("\t%d",i);
return 0;
}
Output:infinite

<!-- Slide number: 91 -->
# MCQs Link
https://www.sanfoundry.com/c-interview-questions-answers/
https://www.geeksforgeeks.org/c-multiple-choice-questions/
https://www.indiabix.com/c-programming/questions-and-answers/
http://www.tutorialspoint.com/cprogramming/cprogramming_online_quiz.htm
https://codingfox.com/7-4-for-loop-points-to-remember/

<!-- Slide number: 92 -->
Predict the output of the program ?
#include<stdio.h>
int main()
{
    if(printf("ABC"))
        printf("True");
    else
        printf("False");
    return 0;
}
a. ABC
b. ABCFalse
c.True
d. ABCTrue
