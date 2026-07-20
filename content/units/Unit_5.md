<!-- Slide number: 1 -->
COMPUTER PROGRAMMING USING C

![E:\Workshop_powerPoint\Pictures\785_LPU.png](Picture2.jpg)
CSE22D
UNIT 5

Department of Computer Science  Engineering | School of Polytechnic | Lovely Professional University |

Slide 1 of 17

<!-- Slide number: 2 -->
# UNIT 5

Pointer, Structure & Union
Slide 2 of 17

### Notes:

<!-- Slide number: 3 -->
# What is a Pointer?
A pointer is a variable that stores the memory address of another variable.
In simple words: A normal variable stores a value, A pointer stores the address of that value.

Slide 3 of 17

<!-- Slide number: 4 -->
# Example
int a = 10;
int *ptr;
ptr = &a;
Explanation:
a is a normal integer variable.
ptr is a pointer to an integer (declared using *).
&a gives the address of variable a.
So, ptr now stores the address of a.

Slide 4 of 17

<!-- Slide number: 5 -->
#
A pointer is initialized by assigning it the address of a variable using the address operator (&).
Syntax: pointer_name = &variable;
Initializing a pointer ensures it points to a valid memory location before use.
You can also initialize a pointer to NULL if it doesn’t point to any variable yet: int *ptr = NULL;

Slide 5 of 17

<!-- Slide number: 6 -->
# Need for Pointers
Pointers are used to:
Access memory directly.
Pass large data efficiently to functions (by reference).
Work with arrays, strings, and dynamic memory allocation.
Build complex data structures like linked lists, trees, etc.

Slide 6 of 17

<!-- Slide number: 7 -->
# Pointer Declaration and Initialization
Syntax:
data_type *pointer_name;
Example:
int *p;        // pointer to int
float *fptr;   // pointer to float
char *cptr;    // pointer to char
You can initialize it like:
int num = 5;
int *p = &num;

Slide 7 of 17

<!-- Slide number: 8 -->
# Assigning Address to a Pointer
We use the address-of operator(&).
Example:
int a = 10;
int *ptr;
ptr = &a;
&a gives the address of variable a.
Ptr now holds that address.
Slide 8 of 17

<!-- Slide number: 9 -->
# How pointer works
Int x=10;
Int *y=&x;
printf(“%d”,x);
printf(“%u”,&x);
printf(“%u”,y);
printf(“%d”,*y);
printf(“%u”,&y);

Slide 9 of 17

<!-- Slide number: 10 -->
# Accessing Value Using Pointer (Dereferencing)
To access the value stored at the address pointed by a pointer, we use the dereference operator (*).
#include <stdio.h>
int main() {
    int a = 20;
    int *ptr = &a;
    printf("Address of a = %p\n", ptr);
    printf("Value of a = %d\n", *ptr);
    return 0;
}
OUTPUT:
Address of a = 0x7ffeefbff45c
Value of a = 20

Slide 10 of 17

<!-- Slide number: 11 -->
# Pointer Operators
| Operator | Symbol | Description |
| --- | --- | --- |
| Address-of | & | Gives the address of a variable |
| Dereference | \* | Accesses the value stored at the given address |
Slide 11 of 17

<!-- Slide number: 12 -->
# Changing Value using Pointer
We can modify the variable’s value through its pointer.
Example:
#include <stdio.h>
int main() {
    int a = 5;
    int *p = &a;
    *p = 20;   // Changes value of 'a'
    printf("Value of a after change: %d", a);
    return 0;
}
OUTPUT: Value of a after change: 20

Slide 12 of 17

<!-- Slide number: 13 -->
# Pointer Initialization
Pointers can be initialized during declaration:
int a = 10;
int *p = &a;
or assigned later:
int *p;
p = &a;

Slide 13 of 17

<!-- Slide number: 14 -->
# Important Points
Pointer must be assigned a valid address before dereferencing.
Using an uninitialized pointer causes segmentation fault (runtime error).
The data type of the pointer and the variable it points to must match.
NULL is often used to initialize a pointer when it doesn’t point anywhere.
int *p = NULL;

Slide 14 of 17

<!-- Slide number: 15 -->
#
| Concept | Symbol | Purpose |
| --- | --- | --- |
| Address-of Operator | & | Gives address of variable |
| Dereference Operator | \* | Accesses value at address |
| Pointer Declaration | data\_type \*ptr; | Declares pointer |
| Pointer Initialization | ptr = &var; | Stores address |
| Null Pointer | ptr = NULL; | Safe initialization |
Slide 15 of 17

<!-- Slide number: 16 -->
# Introduction to Structures
A structure in C is a user-defined data type that allows you to combine data items of different types under a single name.
It is used to represent a record — for example, a student, employee, or product.

Slide 16 of 17

<!-- Slide number: 17 -->
# Why Structures?
Variables store only one data type.Example:
int roll;     // only number
char name[20]; // only text
But what if we need to store both roll and name for each student?
Structure helps group these together.

Slide 17 of 17

<!-- Slide number: 18 -->
# Declaration of a Structure
Syntax:
struct structure_name {
    data_type member1;
    data_type member2;
    ...
};
Example:
struct Student {
    int rollno;
    char name[20];
    float marks;
};
Here student is the structure name.
Rollno,name,marks are members of the structure.
Slide 18 of 17

<!-- Slide number: 19 -->
# Declaring Structure Variables
There are two ways:
Separate Declaration:
struct Student {
    int rollno;
    char name[20];
    float marks;
};

struct Student s1, s2;  // structure variables

Slide 19 of 17

<!-- Slide number: 20 -->
# (b) Declaration Along with Definition:
struct Student {
    int rollno;
    char name[20];
    float marks;
} s1, s2;

Slide 20 of 17

<!-- Slide number: 21 -->
# Accessing Structure Members
Structure members are accessed using the dot (.) operator.
Syntax:
structure_variable.member_name
Example:
s1.rollno = 101;
strcpy(s1.name, "Aman");
s1.marks = 89.5;
Printing Members:
printf("Roll No: %d\n", s1.rollno);
printf("Name: %s\n", s1.name);
printf("Marks: %.2f\n", s1.marks);

Slide 21 of 17

<!-- Slide number: 22 -->
# Structure Declaration and Access
#include <stdio.h>
#include <string.h>
struct Student {
    int rollno;
    char name[20];
    float marks;
};
int main() {
    struct Student s1;
    s1.rollno = 101;
    strcpy(s1.name, "Aman");
    s1.marks = 89.5;
    printf("Student Details:\n");
    printf("Roll No: %d\n", s1.rollno);
    printf("Name: %s\n", s1.name);
    printf("Marks: %.2f\n", s1.marks);
    return 0;
}

Slide 22 of 17

<!-- Slide number: 23 -->
# output
Student Details:
Roll No: 101
Name: Aman
Marks: 89.50

Slide 23 of 17

<!-- Slide number: 24 -->
# Structure Initialization
We can assign initial values when defining a structure variable.
Example:
struct Student {
    int rollno;
    char name[20];
    float marks;
};
int main() {
    struct Student s1 = {101, "Riya", 95.0};
    printf("Roll No: %d\n", s1.rollno);
    printf("Name: %s\n", s1.name);
    printf("Marks: %.2f\n", s1.marks);
    return 0;
}

Slide 24 of 17

<!-- Slide number: 25 -->
# OUTPUT
Roll No: 101
Name: Riya
Marks: 95.00

Slide 25 of 17

<!-- Slide number: 26 -->
# Union
1. Introduction
A union in C is a user-defined data type similar to a structure, but with one key difference —all members share the same memory location.
It allows storing different types of data in the same memory location, but only one member can hold a value at a time.

Slide 26 of 17

<!-- Slide number: 27 -->
# Syntax of Union
union union_name {
    data_type member1;
    data_type member2;
    ...
};

Slide 27 of 17

<!-- Slide number: 28 -->

![](Picture3.jpg)

<!-- Slide number: 29 -->
# Memory Allocated to Union

![](Picture6.jpg)

![](Picture3.jpg)

<!-- Slide number: 30 -->
# Key Points
Union is defined using the keyword union.
Memory is shared among all members.
Size of union = size of the largest member.
Only one member can store a value at a time (the latest assigned member).
Declared variables of union type are similar to structure variables.

Slide 30 of 17

<!-- Slide number: 31 -->
# Memory is shared among all members
Unlike a structure, where each member has its own memory space, in a union all members share the same memory location.
That means changing one member’s value overwrites the other members’ data.

d.i = 10;
d.f = 2.5;  // overwrites the memory used by i
Now d.i will no longer hold 10 correctly, since both i and f share the same memory.

Slide 31 of 17

<!-- Slide number: 32 -->
# Only one member can store a value at a time
At any moment, only one member’s value is valid — the last one assigned.
Example:
union Data d;
d.i = 100;
d.f = 10.5;
printf("%d\n", d.i);  // produces garbage, because d.f overwrote the shared memory
printf("%f\n", d.f);  // prints 10.500000

Slide 32 of 17

<!-- Slide number: 33 -->
# Example: Declaration and Access
#include <stdio.h>
union Data {
    int i;
    float f;
    char str[20];
};
int main() {
    union Data data;
    data.i = 10;
    printf("data.i = %d\n", data.i);
    data.f = 220.5;
    printf("data.f = %.2f\n", data.f);

    // Now data.i value will be corrupted because memory is shared
    printf("data.i after assigning data.f = %d\n", data.i);
    return 0;
}

Slide 33 of 17

<!-- Slide number: 34 -->
# OUTPUT
data.i = 10
data.f = 220.50
data.i after assigning data.f = 1091567616
Explanation:
When data.f is assigned, it overwrites the memory location of data.i.
Slide 34 of 17

<!-- Slide number: 35 -->
# Union vs Structure
| Feature | Structure | Union |
| --- | --- | --- |
| Memory | Separate memory for each member | Shared memory among members |
| Size | Sum of all members | Size of largest member |
| Value | All members can hold values simultaneously | Only one member can hold value at a time |
| Use Case | When all data members are needed | When only one member is needed at a time |
Slide 35 of 17
