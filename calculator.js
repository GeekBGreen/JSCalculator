var currentState = 0; //Initializing State machine to CalcStateMachine.AwaitingInput. Have to use int at this point because CalcStateMachine hasn't been declared yet.
var equation = "";
var base_mode = "Decimal";
var errorFlag = 0; //NoErrors
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
    ValidateEQ: 5,
    EvaluteEQ: 6,
    DisplayAnswer: 7
}

// Error type flag enum object
const ErrorType = {
    NoErrors: 0,
    InvalidInput: 1,
    InvalidEquation: 2
}

function UpdateStateMachine(buttonPressed)
{
    switch (currentState)
    {
        case CalcStateMachine.AwaitingInput:
            // Was the button pressed a number or operator, the clear button, or the equals button?
            LogStateToConsole("AwaitingInput", buttonPressed);

            if (ButtonPressedIsEquals(buttonPressed))
            {
                currentState = CalcStateMachine.EvaluteEQ;
                UpdateStateMachine(buttonPressed);
                break;
            }
            else if (ButtonPressedIsClear(buttonPressed))
            {
                currentState = CalcStateMachine.DeleteEQ;
                UpdateStateMachine(buttonPressed);
                break;
            }
            else // a number or operator button was pressed
            {
                currentState = CalcStateMachine.ValidateInput;
                // Fall through to the next state
            }

        case CalcStateMachine.ValidateInput:
            LogStateToConsole("ValidateInput", buttonPressed);

            if(!ValidInput(buttonPressed))
            {
                errorFlag = ErrorType.InvalidInput;
                currentState = CalcStateMachine.DisplayErrorMsg;
                UpdateStateMachine(buttonPressed);
                break;
            }
            else
            {
                // Input is valid
                // Fall through to the next state
            }

        case CalcStateMachine.AddInputToEQ:
            LogStateToConsole("AddInputToEQ", buttonPressed);

            equation += buttonPressed;
            document.myForm.user_input.value += buttonPressed;

            //debug
            console.log("Equation now: '" + equation + "'");
            //endOfDebug

            currentState = CalcStateMachine.AwaitingInput;
            break;

        case CalcStateMachine.DisplayErrorMsg:
            LogStateToConsole("DisplayErrorMsg", buttonPressed);

            switch (errorFlag) {
                case 0:
                    console.log("Possible bug, showing an error state of No Errors but displaying error message.");
                    break;
                case 1:
                    console.log("Error thrown - Invalid Input");
                    window.alert("ERROR: Invalid input. Please start equation again.");
                    break;
                case 2:
                    console.log("Error thrown - Invalid Equation");
                    window.alert("ERROR: Invalid equation. Please check parentheses and start again.");
                    break;
                default:
                    console.log("Possible bug, got to default case of error handling.");
            }
            // Fall into next state

        case CalcStateMachine.DeleteEQ:
            LogStateToConsole("DeleteEQ", buttonPressed);

            equation = "";
            document.myForm.equation.value = "Your equation here";

            errorFlag = 0; // Also clear any error flags

            currentState = CalcStateMachine.AwaitingInput;

            break;

        case CalcStateMachine.ValidateEQ:
            LogStateToConsole("ValidateEQ", buttonPressed);

            if(!ValidEquation(equation))
            {
                errorFlag = ErrorType.InvalidEquation;
                currentState = CalcStateMachine.DisplayErrorMsg;
                UpdateStateMachine(buttonPressed);
                break;
            }
            else
            {
                // Input is valid
                // Fall through to the next state
            }

        case CalcStateMachine.EvaluteEQ:
            LogStateToConsole("EvaluteEQ", buttonPressed);

            // Do something
            
            // Fall into next state
        case CalcStateMachine.DisplayAnswer:
            LogStateToConsole("DisplayAnswer", buttonPressed);
            // Do something
            break;

        default:
            // Do something
    }
}

function ButtonPressedIsEquals(passedButtonVal)
{
    //debug
    console.log("\nTeting for equals, value passed = '" + passedButtonVal + "'");
    //endOfDebug
    if (passedButtonVal == '=')
        {
            console.log("ButtonPressedIsEquals: returning true");
            return true;
        }
    else
    {
            console.log("ButtonPressedIsEquals: returning false");
            return false;
    }
}

function ButtonPressedIsClear(passedButtonVal)
{
    //debug
    console.log("\nTeting for clear, value passed = '" + passedButtonVal + "'");
    //endOfDebug
    if (passedButtonVal == 'CLR')
        {
            console.log("ButtonPressedIsClear: returning true");
            return true;
        }
    else
    {
        console.log("ButtonPressedIsClear: returning false");
        return false;
    }
}

function LogStateToConsole(state, buttonLog)
{
    console.log("\nEntering State: " + state);
    console.log("Button Pressed = '" + buttonLog + "'");
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
		if(ValidInput(val)) // If the new input value is a valid number then display it
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

function ValidInput(currentInput)
{
    switch(base_mode)
    {
  		case "Decimal":
  			if(currentInput.match(/^[0-9\(\)\+\-\*\/]$/))
  			{
                return true;
            }
  			else
  			{
                // Input contains invalid characters
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

function ValidEquation(currentEquation)
{

  switch(base_mode)
  {
		case "Decimal":
			if(currentEquation.test(/^[0-9\(\)\+\-\*\/]+$/) != NULL) // Test to see if current equation only contains valid characters
			{
                // Test to see if there are an equal amount of opening and closing parentheses
                var openParenthesesCount = currentEquation.match(/\(/g).length != NULL ?  currentEquation.match(/\(/g).length : 0;
                var closeParenthesesCount = currentEquation.match(/\)/g).length != NULL ? currentEquation.match(/\)/g).length : 0;

                if(openParenthesesCount == closeParenthesesCount)
				{
                    return true;
                }
                else
                {
                    // Equation is invalid because the parentheses counts don't match.
                    return false;
                }
			}
			else
			{
                // Equation contains invalid characters
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
