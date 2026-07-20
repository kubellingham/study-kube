<!-- Slide number: 1 -->
Computer System Architecture  COMP201Th
Unit:  3  Programming the Basic Computer
Lecture: 2  Addressing Modes

The term addressing modes refers to the way in which the operand of an  instruction is specified. The addressing mode specifies a rule for interpreting or  modifying the address field of the instruction before the operand is actually  executed.
Thus, the different ways of specifying the  instruction are called as addressing modes:
Implied/ Implicit Addressing Mode
Stack addressing Mode
Immediate Addressing Mode
Direct Addressing Mode
Indirect Addressing Mode
Register Direct Addressing Mode
Register Indirect Addressing Mode
Relative Addressing Mode
Indexed Addressing Mode
location  of  an  operand  in  an
Base Register Addressing Mode
Auto-increment Addressing Mode
Auto-decrement Addressing Mode

Implied Addressing Mode: In this addressing mode, the definition of the  instruction itself specify the operands implicitly. It is also called as implicit  addressing mode.
e.g.
The	instruction	“Complement	Accumulator”	is	an	implied	mode  instruction (CMA).
In a stack organized computer, zero address instructions are  implied  mode instructions.

<!-- Slide number: 2 -->
Stack Addressing Mode: In this addressing mode, the operand is contained at  the top of the stack.
e.g. ADD
This instruction simply pops out two symbols contained at the top of the stack.  The addition of those two operands is performed.
The result so obtained after addition is pushed again at the top of the stack.

Immediate Addressing Mode: In this addressing mode, the  operand  is  specified in the instruction explicitly.  Instead of  address field,  an operand field  is present that contains the operand.
e.g. ADD 100 will increment the value stored in the accumulator by 10.  MOV R #20 initialized register R to a constant value 20.

Direct Addressing Mode: In this addressing mode, the address field of the  instruction contains the effective address of the operand. Only one reference to  memory is required to fetch the operand. It is  also  called  as  absolute  addressing mode.

![](object3.jpg)

<!-- Slide number: 3 -->
Indirect Addressing Mode: In this addressing mode, the address field of the  instruction specifies the address of memory location that contains the effective  address of the operand. Two references to memory are required to fetch the  operand.

![](object4.jpg)
Register Direct Addressing Mode: In this addressing mode, the operand is  contained in a register set. The address field of the instruction refers to a CPU  register that contains the operand. No reference to memory is required to fetch  the operand.

![](object5.jpg)

<!-- Slide number: 4 -->
Register Indirect Addressing Mode: In this addressing  mode,  the  address  field of the instruction refers to a CPU register that contains  the  effective  address of the operand. Only one reference to memory is required to fetch the  operand.

![](object3.jpg)
