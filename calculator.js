var currentState = CalcStateMachine.AwaitingInput; // Initializing state machine
var base_mode = "Decimal";
var valid_eq = true;
var end_of_equation = false;
var memory = 0;
var prev_op_selected = "";
var eval_call_count = 0;  // Helps the evaluate function know when there are enough numbers to calculate

// State machine enum object
const CalcStateMachine = {
    AwaitingInput: 0,
    ValidateInput: 1,
    AddInputToEQ: 2,
    DisplayErrorMsg: 3,
    DeleteEQ: 4,
    EvaluteEQ: 5,
    DisplayAnswer: 6
}

function UpdateStateMachine(buttonPressed)
{
    switch (currentState)
    {
        case CalcStateMachine.AwaitingInput:
            // Was the button pressed a number or operator, the clear button, or the equals button?
            if (ButtonPressedIsEquals)
            {
                currentState = CalcStateMachine.EvaluteEQ;
                UpdateStateMachine(buttonPressed); // Going to try some recursion for the first time since college... we'll see how this goes.
                break;
            }
            else if (ButtonPressedIsClear)
            {
                currentState = CalcStateMachine.DeleteEQ;
                UpdateStateMachine(buttonPressed);
                break;
            }
            else
            {
                currentState = CalcStateMachine.ValidateInput;
                // Fall through to the next state
            }
        case CalcStateMachine.ValidateInput:
            // Do something
            break;
        case CalcStateMachine.AddInputToEQ:
            // Do something
            break;
        case CalcStateMachine.DisplayErrorMsg:
            // Do something
            // Fall into next state
        case CalcStateMachine.DeleteEQ:
            // Do something
            break;
        case CalcStateMachine.EvaluteEQ:
            // Do something
            // Fall into next state
        case CalcStateMachine.DisplayAnswer:
            // Do something
            break;
        default:
            // Do something
    }
}

function ButtonPressedIsEquals(buttonPressed)
{
    if (buttonPressed == '=')
        {
            return true;
        }
    else
    {
            return false;
    }
}

function ButtonPressedIsClear(buttonPressed)
{
    if (buttonPressed == 'CLR')
        {
            return true;
        }
    else
    {
            return false;
    }
}

function ClearEQ()
{
    document.myForm.user_input.value = "";
    document.myForm.equation.value = "";
    document.myForm.answer.value = "";

	memory = null;
	eval_call_count = 0;
	end_of_equation = false;
}

function ChangeFocus(new_focus)
{
  document.getElementById(new_focus).focus();
}


function DisplayInput(val) //Used to fill out the equation and input text field when buttons are used.
{
  if(!end_of_equation)
  {
	  if(document.myForm.equation.value=="Your equation here")
	  {
		document.myForm.user_input.value= val;
		document.myForm.equation.value = "";
	  }
	  else //If it's not the first button press
	  {
		if(ValidateInput(val)) // If the new input value is a valid number then display it
		{
		  document.myForm.user_input.value = document.myForm.user_input.value + val;
		}
		else // val is an operator
		{
		  if (val == "=")
		  {
			document.myForm.equation.value = document.myForm.equation.value + document.myForm.user_input.value + " " + val;
			Evaluate();

			end_of_equation = true;
		  }
		  else
		  {
			document.myForm.equation.value = document.myForm.equation.value + document.myForm.user_input.value + " " + val + " ";
			document.myForm.user_input.value = "";

			Evaluate();
		  }
		}
	  }
  }
  else
  {
	window.alert("Please press CLEAR to evaluate a new equation");
  }

}


function ChangeBaseMode()
{
  var sel = document.getElementById("base_selector");
  base_mode = sel.options[sel.selectedIndex].value;

  return base_mode;
}


/*
 Does not consider order of operations because it is only meant to be used to evaluate an equation
 with two values (one operator): i.e. 2+3 or 5*5. This is meant to be used to evaluate as each
 operator button is pushed to create a more complex equation (like the calc app in windows)
*/
function Evaluate()
{
	var user_input = document.myForm.user_input.value;
	var equation = document.myForm.equation.value;
	var input_and_op = null; //current input value and operator button pressed
	var input = null;
	var answer = null;

	eval_call_count++;

	//debug - print eval count to console
	console.log("\n\neval_call_count = " + eval_call_count);
	// end of debug

	// If the input is valid, evaluate in the appropriate base system
	switch(base_mode)
	{
	case "Decimal":

		//if cases for the operator: +, -, *, /, and =
		if (equation.match(/\d+\s\+\s$/)) //if operator is "+"
		{
			input_and_op = equation.match(/\d+\s\+\s$/);
			input = parseInt(input_and_op[0].match(/^\d+/));
			//debug - print input_and_op match to console
			console.log("input_and_op: '" + input_and_op + "'");
			//end of debug

			if(eval_call_count == 1) //Store first value in memory and first operator in prev_op_selected
			{
				memory = input; // parsing the number from the string
				prev_op_selected = input_and_op[0].match(/\+/); // parsing the operator from the string

				//debug - print memory and prev_op_selected onto console
				console.log("memory = '" + memory + "'");
				console.log("prev_op_selected = '" + prev_op_selected + "'");
				//end of debug
			}
			else
			{
				answer = Eval_Previous_Operation(prev_op_selected[0], input);

				memory = answer;
				prev_op_selected = input_and_op[0].match(/\+/); // parsing the operator from the string. Current op

				//debug - print memory and prev_op_selected onto console
				console.log("memory = '" + memory + "'");
				console.log("prev_op_selected = '" + prev_op_selected + "'");
				//end of debug
			}

		}
		else if (equation.match(/\d+\s-\s$/)) //if operator is "-"
		{
			input_and_op = equation.match(/\d+\s-\s$/);
			input = parseInt(input_and_op[0].match(/^\d+/));
			//debug - print input_and_op match to console
			console.log("input_and_op: '" + input_and_op + "'");
			//end of debug

			if(eval_call_count == 1) //Store first value in memory and first operator in prev_op_selected
			{
				memory = input; // parsing the number from the string
				prev_op_selected = input_and_op[0].match(/-/); // parsing the operator from the string

				//debug - print memory and prev_op_selected onto console
				console.log("memory = '" + memory + "'");
				console.log("prev_op_selected = '" + prev_op_selected + "'");
				//end of debug
			}
			else
			{
				answer = Eval_Previous_Operation(prev_op_selected[0], input);

				memory = answer;
				prev_op_selected = input_and_op[0].match(/-/); // parsing the operator from the string. Current op

				//debug - print memory and prev_op_selected onto console
				console.log("memory = '" + memory + "'");
				console.log("prev_op_selected = '" + prev_op_selected + "'");
				//end of debug
			}
		}
		else if (equation.match(/\d+\s\*\s$/)) //if operator is "*"
		{
			input_and_op = equation.match(/\d+\s\*\s$/);
			input = parseInt(input_and_op[0].match(/^\d+/));
			//debug - print input_and_op match to console
			console.log("input_and_op: '" + input_and_op + "'");
			//end of debug

			if(eval_call_count == 1) //Store first value in memory and first operator in prev_op_selected
			{
				memory = input; // parsing the number from the string
				prev_op_selected = input_and_op[0].match(/\*/); // parsing the operator from the string

				//debug - print memory and prev_op_selected onto console
				console.log("memory = '" + memory + "'");
				console.log("prev_op_selected = '" + prev_op_selected + "'");
				//end of debug
			}
			else
			{
				answer = Eval_Previous_Operation(prev_op_selected[0], input);

				memory = answer;
				prev_op_selected = input_and_op[0].match(/\*/); // parsing the operator from the string. Current op

				//debug - print memory and prev_op_selected onto console
				console.log("memory = '" + memory + "'");
				console.log("prev_op_selected = '" + prev_op_selected + "'");
				//end of debug
			}
		}
		else if (equation.match(/\d+\s\/\s$/)) //if operator is "/"
		{
			input_and_op = equation.match(/\d+\s\/\s$/);
			input = parseInt(input_and_op[0].match(/^\d+/));
			//debug - print input_and_op match to console
			console.log("input_and_op: '" + input_and_op + "'");
			//end of debug

			if(eval_call_count == 1) //Store first value in memory and first operator in prev_op_selected
			{
				memory = input; // parsing the number from the string
				prev_op_selected = input_and_op[0].match(/\//); // parsing the operator from the string

				//debug - print memory and prev_op_selected onto console
				console.log("memory = '" + memory + "'");
				console.log("prev_op_selected = '" + prev_op_selected + "'");
				//end of debug
			}
			else
			{
				answer = Eval_Previous_Operation(prev_op_selected[0], input);

				memory = answer;
				prev_op_selected = input_and_op[0].match(/\//); // parsing the operator from the string. Current op

				//debug - print memory and prev_op_selected onto console
				console.log("memory = '" + memory + "'");
				console.log("prev_op_selected = '" + prev_op_selected + "'");
				//end of debug
			}
		}
		else if (equation.match(/\d+\s\=$/)) //if operator is "="
		{
			input_and_op = equation.match(/\d+\s=$/);
			input = parseInt(input_and_op[0].match(/^\d+/));
			//debug - print input_and_op match to console
			console.log("input_and_op: '" + input_and_op + "'");
			//end of debug

			if(eval_call_count == 1)
			{
				memory = 0; // parsing the number from the string
				prev_op_selected = input_and_op[0].match(/=/); // parsing the operator from the string

				answer = input;
				//debug - print memory and prev_op_selected onto console
				console.log("memory = '" + memory + "'");
				console.log("prev_op_selected = '" + prev_op_selected + "'");
				//end of debug
			}
			else
			{
				answer = Eval_Previous_Operation(prev_op_selected[0], input);

				memory = 0;
				prev_op_selected = input_and_op[0].match(/=/); // parsing the operator from the string. Current op

				//debug - print memory and prev_op_selected onto console
				console.log("memory = '" + memory + "'");
				console.log("prev_op_selected = '" + prev_op_selected + "'");
				//end of debug
			}
		}
		else
		{
			answer = "INVALID OPERATOR";
			end_of_equation = true;
		}

		break;


	case "Binary":

		// Placeholder until binary is implemented
		answer = document.myForm.equation.value

	break;


	case "Hexadecimal":

		// Placeholder until hex is implemented
		answer = document.myForm.equation.value

	break;


	default:
		answer = "Invalid Base";
	}

	  document.myForm.answer.value = answer;

	  return answer;
}

function Eval_Previous_Operation(prev_op, current_value)
{
	var result = null;

	//evaluate the current value with the previous operator
	switch(prev_op)
	{
		case "+":
			result = parseInt(memory) + current_value;
			break;
		case "-":
			result = parseInt(memory) - current_value;
			break;
		case "*":
			result = parseInt(memory) * current_value;
			break;
		case "/":
		    result = parseInt(memory) / current_value;
			break;
		default:
			result = "Previous Operator Invalid";
	}

	return result;
}

function ValidateInput(user_input)
{

  switch(base_mode)
  {
		case "Decimal":
			if(user_input.match(/[0-9]/)) // Checking to see if equation only contains decimal numbers
			{
				return true;
			}
			else
			{
				return false;
			}
			break;
		case "Binary":
			// Check if the equation is valid by checking for any digit not 0 or 1
			break;
		case "Hexadecimal":
			// Check if the equation is valid by checking for anything outside of 0-9 and A-F
			break;
		default:
			return false;
	}

}
