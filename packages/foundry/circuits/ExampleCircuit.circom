pragma circom 2.0.0;

template ExampleCircuit() {
    signal input a;
    signal input b;
    signal output c;

    c <== a*b;
 }

// Input "a" is publicly visible, whereas input "b" is not.
// The result output "c" of the computation is also public.
component main{public [a]} = ExampleCircuit();
