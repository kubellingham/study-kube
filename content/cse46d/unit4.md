___PPT12
___PPT10
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
© LPU :: CSE101 C Programming :: Dr. Lovi Raj Gupta
___PPT9
___PPT9
*
___PPT9
___PPT9
___PPT10
1_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
2_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
3_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
4_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
5_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
6_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
7_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
8_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
9_Office Theme
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
*
___PPT9
___PPT9
*
___PPT10
10_Office Theme
___PPT9
___PPT9
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT10
11_Office Theme
___PPT9
___PPT9
___PPT9
Click to edit Master title style
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT10
12_Office Theme
___PPT9
___PPT9
*
Click to edit Master text styles
Second level
Third level
Fourth level
Fifth level
___PPT9
___PPT9
*
___PPT10
___PPT9
CSE-46DCOMPUTER Architecture
___PPT10
Course details
___PPT9
Course Code- CSE 46D
Course Title- Computer Architecture
LTP - 3 0 0 [Three lectures/week]
Credits: 3
___PPT10
___PPT9
Addition and subtraction
___PPT10
___PPT10
___PPT9
Addition
(+10)+(+3)
10=0 1010
3=0 0011
0 1010
+ 0 0011
0 1101(13)
___PPT10
___PPT9
Subtraction using 2’s complement
___PPT9
-10-(-3)
___PPT9
(-A)-(-B)
-10=1 1010
3= 0 0011
1’s complement of 3 = 0 1100
2’s complement of 3 =	+1
0 1101
1 1010
+0 1101	
1	0111 = -7
___PPT10
___PPT9
Addition
(+10)+(+3)
(+10)+(-3)
(-10)+(+3)


Subtraction
(+10)-(+3)
(+10)-(-3)
(-10)-(+3)
(-10)-(-3)
___PPT10
___PPT10
It consists of register A and B and sign flip-flop As and Bs.

Subtraction is done by adding A to the 2’s complement of B.
The output carry is transferred to flip-flop E.
AVF holds the overflow bit when A and B are added.
The addition of A and B	is done through parallel adder.

The	output	of	the	adder	is	applied	to	the	input	of	A register.
___PPT10
Complementer  provides an output of B or the complement of B depending on the state of the mode control M.

When M=0, the output of B  is transferred to the adder, the input carry is 0, and the output of the adder is equal to the sum A+B.

When M=1,  the 1’S complement of B is applied to the adder, the input carry is 1, and output S=A+B’+1, which is equal to A-B.
___PPT10
___PPT10
MULTILICATION:

Multiplication of two fixed point binary number in signed magnitude representation is done with process of successive shift and add operation.
___PPT10
Hardware Implementation :
___PPT10
Flowchart of Multiplication
___PPT10
___PPT10
___PPT9
Booth Multiplier
This algorithm is the multiplication algorithm 	that multiplies two signed numbers in two’s 	complement.

Invented by Andrew Donald booth in 1951.

Booth  uses  small  number  of  additions  and 	shift   operations   to   do   the   work   of 	multiplication.
___PPT10
___PPT9
The algorithm
___PPT9
STEP 1
Decide	which	operand	will	be	the	multiplier and which will be the multiplicand.
EX- multiplicand=7(M)=0111
multiplier 3(Q)= 0011
register A=0000
register Qn=0
register count=no. of bits.(4)
___PPT10
STEP2
Determine	the	LSB	and	the determine the arithmetic action.
___PPT9
previous	LSB	to
OO= arithmetic shift right
11= arithmetic shift right
10=	subtract	multiplicand	from	the	left	half	of product.
01= add multiplicand from the left half of product.
___PPT10
STEP3
When count register is not 0 then continue the multiplication.
If count register is 0 then END the algorithm.
___PPT10
___PPT10
-9 X -13 = + 117
___PPT10
___PPT9
Ex-	7*3
-6*7
14*-5
___PPT10
___PPT9
___PPT10
___PPT9
___PPT9
___PPT10
