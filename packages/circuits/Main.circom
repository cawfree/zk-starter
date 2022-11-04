pragma circom 2.0.0;

template Main() {
    signal input a;
    signal input b;
    signal output c;
    c <== a*b;
 }

 component main = Main();