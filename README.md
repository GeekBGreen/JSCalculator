JS Calculator
=================

A Calculator made in javascript.

Currently only supports decimal math.

To do list before release:
> See if the ValidateEQ() function is even needed anymore
> Add a flag that won't allow changing the base mode once input has been entered
> Gray out the equation and answer text boxes. Change focus to input box when they're focused
> Make sure to add alerts when invalid characters are put into the input box
*>* There's a better way to implement the Evaluate() function: do to prev_op evaluation first,
    then continue to see what the current op is and store that in the appropriate location
> Look up how to write test cases, and practice writing them for this program.
> Make it so you can add to the equation even after pressing "=". (e.g. it will clear the =
  and continue evaluating)
> Try to display the equation only using "mem (op) input" because it doesn't follow the order of
  operations. If someone multiplies later, the equation will appear to be incorrect.


Future Features/Changes:
- Hexadecimal math and conversions
- Binary math and conversions
- Use xml file for content instead of directly embedding it into html?
- You can type your input into the input box just like you would using the windows calculator. 
  (i.e. typing a number, then hitting an operator, rinse, repeat and it calculates the answer as you go)
- Mobile site
