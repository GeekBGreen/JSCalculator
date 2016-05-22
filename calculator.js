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
    InvalidEQParenMismatch: 2,
    InvalidEQOpAfterOpenParen: 3,
    InvalidEQContainsInvalidChar: 4
}

function UpdateStateMachine(buttonPressed)
{
    var solutionToEq = null;

    switch (currentState)
    {
        case CalcStateMachine.AwaitingInput:
            // Was the button pressed a number or operator, the clear button, or the equals button?
            LogStateToConsole("AwaitingInput", buttonPressed);

            if (ButtonPressedIsEquals(buttonPressed))
            {
                currentState = CalcStateMachine.ValidateEQ;
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

            // Displaying the equation beign built in the appropriate text box
            if (document.myForm.equation.value == "Your equation here")
            {
                document.myForm.equation.value = '';
            }
            document.myForm.equation.value += buttonPressed;

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
                    console.log("Error thrown - Invalid Equation: parentheses mismatch");
                    window.alert("ERROR: Invalid equation. Parentheses mismatch. Please check parentheses and start again.");
                    break;
                case 3:
                    console.log("Error thrown - Invalid Equation: operator found following open parenthesis");
                    window.alert("ERROR: Invalid equation. Operator found following open parenthesis. Please check equation and start again.");
                    break;
                case 4:
                    console.log("Error thrown - Invalid Equation: equation contains invalid characters");
                    window.alert("ERROR: Invalid equation. Contains invalid characters. Please check equation and start again.");
                    break;
                default:
                    console.log("Possible bug, got to default case of error handling.");
            }
            // Fall into next state

        case CalcStateMachine.DeleteEQ:
            LogStateToConsole("DeleteEQ", buttonPressed);

            equation = "";
            solutionToEq = null;
            errorFlag = 0; // Also clear any error flags

            document.myForm.equation.value = "Your equation here";
            document.myForm.answer.value = "Answer appears here";

            currentState = CalcStateMachine.AwaitingInput;

            break;

        case CalcStateMachine.ValidateEQ:
            LogStateToConsole("ValidateEQ", buttonPressed);

            if(!ValidEquation(equation))
            {
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

            solutionToEq = Evaluate();

            currentState = CalcStateMachine.DisplayAnswer;

            // Fall into next state
        case CalcStateMachine.DisplayAnswer:
            LogStateToConsole("DisplayAnswer", buttonPressed);

            document.myForm.answer.value = solutionToEq;

            currentState = CalcStateMachine.AwaitingInput;
            break;

        default:
            console.log("Potential bug. Somewhere got to default state in state machine.");
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

function Evaluate()
{
	var answer = null;
    var subEquation = '';
    var subEQAnswer = null;
    var sideA = null;
    var sideB = null;
    var origSubEQ = '';

	// If the input is valid, evaluate in the appropriate base system
	switch(base_mode)
	{
        case "Decimal":

            // Does equation contain parentheses? If so evaluate all of those first
            while (equation.match(/[\(\)]/))
            {
                var operation = '';
                var parenSetMatches = equation.match(/\([\d\+\-\*\/\.]+\)/g);  // will only match single parentheses sets (not multi tiered)

                //debug
                console.log("\nEntering Decimal Evaluate with parentheses. parenSetMatches = " + parenSetMatches);
                //endOfDebug

                for (var i = 0; i < parenSetMatches.length; i++)
                {
                    //debug
                    console.log("\nCurrent parentheses set: " + parenSetMatches[i]);
                    //endOfDebug

                    origSubEQ = parenSetMatches[i]; // Store the original parentheses set to delete from equation later

                    // match each set of * or / and surrounding numbers from left to right, evaluate, and replace in sub equation
                    // BCG maybe try to replace the below loop with a function call that takes operators as parameter
                    while(parenSetMatches[i].match(/\-?\d+\.?\d*[\*\/]\-?\d+\.?\d*/))
                    {
                        //BCG - Replace following with a function call to something like EvaluateSubEQ(subEQ, op) that returns the subEQAnswer?
                        operation = String(parenSetMatches[i].match(/\-?\d+\.?\d*[\*\/]\-?\d+\.?\d*/));
                        if (operation.match(/\-?\d+\.?\d*\*\-?\d+\.?\d*/))
                        {
                            // Operator is *
                            //debug
                            console.log("Multiplication found");
                            //endOfDebug
                            subEquation = String(operation.match(/\-?\d+\.?\d*\*\-?\d+\.?\d*/));
                            //debug
                            console.log("SubEquation = " + subEquation);
                            //endOfDebug

                            // BCG before parsing we want to verify that if there is a negative that it's a true negative (this will have to be different for a subtraction operation)
                            // If subEquation.match(/^\-/); (if there is a "-" at the beginning of the operation. If there's one on Side B we know it's a real negative)
                            //      TRUE: then lets go on to Verify it's a true negative
                            //      FALSE: then there is no negative. let's go ahead and parse for each sideA
                            // Verify true negative -> If parenSetMatches[i].match(/.\-?\d+\.?\d*\*\-?\d+\.?\d*/);  **Find some how to do one character just before the original match that forms operation string**

                            // parse subEquation for sideA, and sideB
                            if (subEquation.match(/^\-/))
                            {
                                if(SideATrueNegative(parenSetMatches[i], subEquation))
                                {
                                    // Side A is a true negative number, so continue on.
                                    //debug
                                    console.log("Testing for Side A negativity. Side A is a true negative number.");
                                    //endOfDebug
                                }
                                else
                                {
                                    // Not a true negative number, is a subtraction operator so remove it from the subEquation.
                                    subEquation = subEquation.replace(/^./, '');
                                    //debug
                                    console.log("Testing for Side A negativity. Side A is not a negative number. modifying subEquation.");
                                    console.log("subEquation now = " + subEquation);
                                    //endOfDebug
                                }
                            }

                            sideA = parseFloat(subEquation.match(/^\-?\d+\.?\d*/));
                            sideB = parseFloat(subEquation.match(/\-?\d+\.?\d*$/));
                            //debug
                            console.log("sideA parsed = " + sideA);
                            console.log("sideB parsed = " + sideB);
                            //endOfDebug
                            subEQAnswer = sideA * sideB;
                            //debug
                            console.log("subEQAnswer =  " + subEQAnswer);
                            //endOfDebug
                        }
                        else
                        {
                            // Operator is /
                            //debug
                            console.log("Division found");
                            //endOfDebug
                            subEquation = String(operation.match(/\-?\d+\.?\d*\/\-?\d+\.?\d*/));
                            //debug
                            console.log("SubEquation = " + subEquation);
                            //endOfDebug
                            if (subEquation.match(/^\-/))
                            {
                                if(SideATrueNegative(parenSetMatches[i], subEquation))
                                {
                                    // Side A is a true negative number, so continue on.
                                    //debug
                                    console.log("Testing for Side A negativity. Side A is a true negative number.");
                                    //endOfDebug
                                }
                                else
                                {
                                    // Not a true negative number, is a subtraction operator so remove it from the subEquation.
                                    subEquation = subEquation.replace(/^./, '');
                                    //debug
                                    console.log("Testing for Side A negativity. Side A is not a negative number. modifying subEquation.");
                                    console.log("subEquation now = " + subEquation);
                                    //endOfDebug
                                }
                            }
                            sideA = parseFloat(subEquation.match(/^\-?\d+\.?\d*/));
                            sideB = parseFloat(subEquation.match(/\-?\d+\.?\d*$/));
                            //debug
                            console.log("sideA parsed = " + sideA);
                            console.log("sideB parsed = " + sideB);
                            //endOfDebug
                            subEQAnswer = sideA / sideB;
                            //debug
                            console.log("subEQAnswer =  " + subEQAnswer);
                            //endOfDebug
                        }

                        // Replace subEquation with with subEQAnswer in string and get rid of parentheses

                        // It found division again after solving. it set modified parenSetMatch to 3 but then found division again... why?

                        parenSetMatches[i] = parenSetMatches[i].replace(subEquation, String(subEQAnswer));
                        parenSetMatches[i] = parenSetMatches[i].replace(/\(/, '');
                        parenSetMatches[i] = parenSetMatches[i].replace(/\)/, '');
                        //debug
                        console.log("modified parenSetMatch =  " + parenSetMatches[i]);
                        //endOfDebug
                    }
                    // match each set of + or - and surrounding numbers from left to right, evaluate, and replace in sub equation
                    while(parenSetMatches[i].match(/\-?\d+\.?\d*[\+\-]\-?\d+\.?\d*/))
                    {
                        operation = String(parenSetMatches[i].match(/\-?\d+\.?\d*[\+\-]\-?\d+\.?\d*/));

                        if (operation.match(/\-?\d+\.?\d*\+\-?\d+\.?\d*/))
                        {
                            // Operator is +
                            //debug
                            console.log("Addition found");
                            //endOfDebug
                            subEquation = String(operation.match(/\-?\d+\.?\d*\+\-?\d+\.?\d*/));
                            //debug
                            console.log("SubEquation = " + subEquation);
                            //endOfDebug
                            // parse subEquation for sideA, and sideB
                            if (subEquation.match(/^\-/))
                            {
                                if(SideATrueNegative(parenSetMatches[i], subEquation))
                                {
                                    // Side A is a true negative number, so continue on.
                                    //debug
                                    console.log("Testing for Side A negativity. Side A is a true negative number.");
                                    //endOfDebug
                                }
                                else
                                {
                                    // Not a true negative number, is a subtraction operator so remove it from the subEquation.
                                    subEquation = subEquation.replace(/^./, '');
                                    //debug
                                    console.log("Testing for Side A negativity. Side A is not a negative number. modifying subEquation.");
                                    console.log("subEquation now = " + subEquation);
                                    //endOfDebug
                                }
                            }
                            sideA = parseFloat(subEquation.match(/^\-?\d+\.?\d*/));
                            sideB = parseFloat(subEquation.match(/\-?\d+\.?\d*$/));
                            //debug
                            console.log("sideA parsed = " + sideA);
                            console.log("sideB parsed = " + sideB);
                            //endOfDebug
                            subEQAnswer = sideA + sideB;
                            //debug
                            console.log("subEQAnswer =  " + subEQAnswer);
                            //endOfDebug
                        }
                        else
                        {
                            // Operator is -
                            //debug
                            console.log("Subtraction found");
                            //endOfDebug
                            subEquation = String(operation.match(/\-?\d+\.?\d*\-\-?\d+\.?\d*/));
                            //debug
                            console.log("SubEquation = " + subEquation);
                            //endOfDebug
                            // parse subEquation for sideA, and sideB
                            if (subEquation.match(/^\-/))
                            {
                                if(SideATrueNegative(parenSetMatches[i], subEquation))
                                {
                                    // Side A is a true negative number, so continue on.
                                    //debug
                                    console.log("Testing for Side A negativity. Side A is a true negative number.");
                                    //endOfDebug
                                }
                                else
                                {
                                    // Not a true negative number, is a subtraction operator so remove it from the subEquation.
                                    subEquation = subEquation.replace(/^./, '');
                                    //debug
                                    console.log("Testing for Side A negativity. Side A is not a negative number. modifying subEquation.");
                                    console.log("subEquation now = " + subEquation);
                                    //endOfDebug
                                }
                            }
                            sideA = parseFloat(subEquation.match(/^\-?\d+\.?\d*/));
                            //sideB = parseFloat(subEquation.match(/\-?\d+\.?\d*$/));
                            sideB = ParseSideB(subEquation);
                            //debug
                            console.log("sideA parsed = " + sideA);
                            console.log("sideB parsed = " + sideB);
                            //endOfDebug
                            subEQAnswer = sideA - sideB;
                            //debug
                            console.log("subEQAnswer =  " + subEQAnswer);
                            //endOfDebug
                        }

                        // Replace subEquation with with subEQAnswer in string and get rid of parentheses
                        parenSetMatches[i] = parenSetMatches[i].replace(subEquation, String(subEQAnswer));
                        parenSetMatches[i] = parenSetMatches[i].replace(/\(/, '');
                        parenSetMatches[i] = parenSetMatches[i].replace(/\)/, '');
                        //debug
                        console.log("modified parenSetMatch =  " + parenSetMatches[i]);
                        //endOfDebug
                    }

                    // Remove the parentheses from the solution
                    parenSetMatches[i] = parenSetMatches[i].replace(/\(/, '');
                    parenSetMatches[i] = parenSetMatches[i].replace(/\)/, '');

                    // Replace the parentheses set with the solution in the original equation
                    equation = equation.replace(origSubEQ, String(parenSetMatches[i]));
                    //debug
                    console.log("modified equation =  " + equation);
                    //endOfDebug
                }
            }

            // Now evaluate the equation without parentheses
            answer = equation;
            // match for any * and surrounding numbers, evaluate, and replace in sub equation
            while(answer.match(/\-?\d+\.?\d*\*\-?\d+\.?\d*/)) //BCG replace conditional with function call to something like HasOperator(subEQ, op) that returns a bool.
            {
                //BCG - Replace following 4 lines with a function call to something like EvaluateSubEQ(subEQ, op) that returns the subEQAnswer?
                subEquation = String(answer.match(/\-?\d+\.?\d*\*\-?\d+\.?\d*/));
                // parse subEquation for sideA, and sideB
                if (subEquation.match(/^\-/))
                {
                    if(SideATrueNegative(answer, subEquation))
                    {
                        // Side A is a true negative number, so continue on.
                        //debug
                        console.log("Testing for Side A negativity. Side A is a true negative number.");
                        //endOfDebug
                    }
                    else
                    {
                        // Not a true negative number, is a subtraction operator so remove it from the subEquation.
                        subEquation = subEquation.replace(/^./, '');
                        //debug
                        console.log("Testing for Side A negativity. Side A is not a negative number. modifying subEquation.");
                        console.log("subEquation now = " + subEquation);
                        //endOfDebug
                    }
                }
                sideA = parseFloat(answer.match(/^\-?\d+\.?\d*/));
                sideB = parseFloat(answer.match(/\-?\d+\.?\d*$/));
                subEQAnswer = sideA * sideB;

                // Replace subEquation with with subEQAnswer in string
                answer = answer.replace(subEquation, String(subEQAnswer));
            }
            // match for any / and surrounding numbers, evaluate, and replace in sub equation
            while(answer.match(/\-?\d+\.?\d*\/\-?\d+\.?\d*/))
            {
                subEquation = String(answer.match(/\-?\d+\.?\d*\/\-?\d+\.?\d*/));
                // parse subEquation for sideA, and sideB
                if (subEquation.match(/^\-/))
                {
                    if(SideATrueNegative(answer, subEquation))
                    {
                        // Side A is a true negative number, so continue on.
                        //debug
                        console.log("Testing for Side A negativity. Side A is a true negative number.");
                        //endOfDebug
                    }
                    else
                    {
                        // Not a true negative number, is a subtraction operator so remove it from the subEquation.
                        subEquation = subEquation.replace(/^./, '');
                        //debug
                        console.log("Testing for Side A negativity. Side A is not a negative number. modifying subEquation.");
                        console.log("subEquation now = " + subEquation);
                        //endOfDebug
                    }
                }
                sideA = parseFloat(answer.match(/^\-?\d+\.?\d*/));
                sideB = parseFloat(answer.match(/\-?\d+\.?\d*$/));
                subEQAnswer = sideA / sideB;

                // Replace subEquation with with subEQAnswer in string
                answer = answer.replace(subEquation, String(subEQAnswer));
            }
            // match for any + and surrounding numbers, evaluate, and replace in sub equation
            while(answer.match(/\-?\d+\.?\d*\+\-?\d+\.?\d*/))
            {
                subEquation = String(answer.match(/\-?\d+\.?\d*\+\-?\d+\.?\d*/));
                // parse subEquation for sideA, and sideB
                if (subEquation.match(/^\-/))
                {
                    if(SideATrueNegative(answer, subEquation))
                    {
                        // Side A is a true negative number, so continue on.
                        //debug
                        console.log("Testing for Side A negativity. Side A is a true negative number.");
                        //endOfDebug
                    }
                    else
                    {
                        // Not a true negative number, is a subtraction operator so remove it from the subEquation.
                        subEquation = subEquation.replace(/^./, '');
                        //debug
                        console.log("Testing for Side A negativity. Side A is not a negative number. modifying subEquation.");
                        console.log("subEquation now = " + subEquation);
                        //endOfDebug
                    }
                }
                sideA = parseFloat(answer.match(/^\-?\d+\.?\d*/));
                sideB = parseFloat(answer.match(/\-?\d+\.?\d*$/));
                subEQAnswer = sideA + sideB;

                // Replace subEquation with with subEQAnswer in string
                answer = answer.replace(subEquation, String(subEQAnswer));
            }
            // match for any - and surrounding numbers, evaluate, and replace in sub equation
            while(answer.match(/\-?\d+\.?\d*\-\-?\d+\.?\d*/))
            {
                subEquation = String(answer.match(/\-?\d+\.?\d*\-\-?\d+\.?\d*/));
                // parse subEquation for sideA, and sideB
                if (subEquation.match(/^\-/))
                {
                    if(SideATrueNegative(answer, subEquation))
                    {
                        // Side A is a true negative number, so continue on.
                        //debug
                        console.log("Testing for Side A negativity. Side A is a true negative number.");
                        //endOfDebug
                    }
                    else
                    {
                        // Not a true negative number, is a subtraction operator so remove it from the subEquation.
                        subEquation = subEquation.replace(/^./, '');
                        //debug
                        console.log("Testing for Side A negativity. Side A is not a negative number. modifying subEquation.");
                        console.log("subEquation now = " + subEquation);
                        //endOfDebug
                    }
                }
                sideA = parseFloat(answer.match(/^\-?\d+\.?\d*/));
                sideB = parseFloat(answer.match(/\-?\d+\.?\d*$/));
                subEQAnswer = sideA - sideB;

                // Replace subEquation with with subEQAnswer in string
                answer = answer.replace(subEquation, String(subEQAnswer));
            }

            // Remove the parentheses from the solution
            answer.replace(/\(/, '');
            answer.replace(/\)/, '');

            //answer should now
            console.log("Solution to equation = " + answer);

            return answer;
		    break;
            // End of refactor code for evaluate Old code begins now


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

	  return answer;
}

function SideATrueNegative(fullExpressionOfSubEQ, subEQ)
{
    var tempStr = ''
    var subEQRegExp = ConvertToRegExp(subEQ);
    var regex = new RegExp('.' + subEQRegExp);

    tempStr = String(fullExpressionOfSubEQ.match(regex));

    if (tempStr.match(/^[^\d]/)) // If the character immediately before the subEQ is not a number
    {
        // Then sideA is truly a negative number
        return true;
    }

    // Otherwise, it's actually a subtraction operation incorrectly captured in the regex
    return false;
}

function ParseSideA(subEQ) // BCG maybe embed true negative validation into this function
{
    return parseFloat(subEQ.match(/^\-?\d+\.?\d*/));
}

function ParseSideB(subEQ)
{
    var bSide = String(subEQ.match(/\-?\d+\.?\d*$/));
    var tempStr = '';

    //debug
    console.log("Entering ParseSideB. bSide = " + bSide);
    //endOfDebug

    if (bSide.match(/\-/)) // BCG side B is not DETECTING THAT IT'S NEGATIVE!!!
    {
        // Then validate that it's a true negative
        //debug
        console.log("B side negative detected. Validating if true.");
        //endOfDebug
        var bSideRegExp = ConvertToRegExp(bSide);
        var tempRegexp = new RegExp('.' + bSideRegExp);

        tempStr = String(subEQ.match(tempRegexp));

        //debug
        console.log("tempStr = " + tempStr);
        //endOfDebug

        if (tempStr.match(/^[^\d]/)) // If the character immediately before sideB is not a number
        {
            // Then sideB is truly a negative number
            //debug
            console.log("Side B truly negative");
            //endOfDebug
        }
        else
        {
            // SideB is not a negative number. Remove the "-" from the beginning of the side
            bSide = bSide.replace(/^./, '');
        }
    }

    return bSide;
}

function ConvertToRegExp(myString)
{
    var strTemp = String(myString)
    //console.log("strTemp = " + strTemp);

    if (strTemp.match(/\*/))
    {
        //console.log("Multiplication found");
        strTemp = strTemp.replace(/\*/, "\\*");
        //console.log("New strTemp = " + strTemp);
    }
    if (strTemp.match(/\//))
    {
        strTemp = strTemp.replace(/\//, "\\/");
    }
    if(strTemp.match(/\+/))
    {
        strTemp = strTemp.replace(/\+/, "\\+");
    }
    if (strTemp.match(/\-/))
    {
        //console.log("Subtraction or Negative found");
        strTemp = strTemp.replace(/\-/, "\\-");
    }

    return strTemp;
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

  currentEquation = String(currentEquation);

  switch(base_mode)
  {
		case "Decimal":
			if(currentEquation.match(/^[0-9\(\)\+\-\*\/]+$/)) // Test to see if current equation only contains valid characters
			{
                // Test to see if there are an equal amount of opening and closing parentheses
                var openParenthesesCount;
                var closeParenthesesCount;

                if(currentEquation.match(/\(/g))
                {
                    openParenthesesCount = currentEquation.match(/\(/g).length;
                }
                else
                {
                    openParenthesesCount = 0;
                }

                if(currentEquation.match(/\(/g))
                {
                    closeParenthesesCount = currentEquation.match(/\)/g).length;
                }
                else
                {
                    closeParenthesesCount = 0;
                }

                if(openParenthesesCount == closeParenthesesCount)
				{
                    if(currentEquation.match(/\([\+\-\*\/]/))
                    {
                        // Equation is invalid because there is an operator immedately following an open parenthesis
                        errorFlag = ErrorType.InvalidEQOpAfterOpenParen;
                        return false;
                    }
                    else
                    {
                        // Equation is valid
                        return true;
                    }
                }
                else
                {
                    // Equation is invalid because the parentheses counts don't match.
                    errorFlag = ErrorType.InvalidEQParenMismatch;
                    return false;
                }
			}
			else
			{
                // Equation contains invalid characters
                errorFlag = ErrorType.InvalidEQContainsInvalidChar;
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
