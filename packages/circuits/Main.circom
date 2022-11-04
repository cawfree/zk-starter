pragma circom 2.0.0;

template Main() {
    signal input a;
    signal input b;
    signal output c;

    c <== a*b;
 }

// Input "a" is publicly visible, whereas input "b" and the result output "c"
// are private.
component main{public [a]} = Main();