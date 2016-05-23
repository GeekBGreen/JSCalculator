var currentState = 0; //Initializing State machine to CalcStateMachine.AwaitingInput. Have to use int at this point because CalcStateMachine hasn't been declared yet.
var equation = "";
var base_mode = "Decimal";
var errorFlag = 0; //NoErrors
var end_of_equation = false;
var memory = 0;
var prev_op_selected = "";
var eval_call_count = 0;  // Helps the evaluate function know when there are enough numbers to calculate
var lastButtonWasEquals = false;

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
    InvalidEQContainsInvalidChar: 4,
    InvalidUseOfDecimalPoints: 5
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
                lastButtonWasEquals = true;
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

            console.log("lastButtonWasEquals = " + lastButtonWasEquals);

            // Displaying the equation beign built in the appropriate text box
            if (document.myForm.equation.value == "Your equation here")
            {
                document.myForm.equation.value = '';
            }

            if (lastButtonWasEquals)
            {
                // Set the display to show solution from last calculation as current equation
                document.myForm.equation.value = equation;
                lastButtonWasEquals = false;
            }
            else
            {
                document.myForm.equation.value += buttonPressed;
            }

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
                case 5:
                    console.log("Error thrown - Invalid Equation: equation contains invalid use of decimal points");
                    window.alert("ERROR: Invalid equation. Contains invalid use of decimal points. Please check equation and start again.");
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
            equation = solutionToEq; // Set this way to continue calulations after an evaluation

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
    var expression = '';
    var sideA = null;
    var sideB = null;
    var origSubEQ = '';
    var modSubEQ = Object(false); // creating an object to pass this flag by reference to Parse functions

	// If the input is valid, evaluate in the appropriate base system
	switch(base_mode)
	{
        case "Decimal":

            // Does equation contain parentheses? If so evaluate all of those first
            while (equation.match(/[\(\)]/))
            {
                var parenSetMatches = equation.match(/\([\d\+\-\*\/\.]+\)/g);  // will only match single parentheses sets (not multi tiered)

                for (var i = 0; i < parenSetMatches.length; i++)
                {

                    origSubEQ = parenSetMatches[i]; // Store the original parentheses set to delete from equation later

                    // match each set of * or / and surrounding numbers from left to right, evaluate, and replace in sub equation
                    while(parenSetMatches[i].match(/\-?\d+\.?\d*[\*\/]\-?\d+\.?\d*/))
                    {
                        expression = String(parenSetMatches[i].match(/\-?\d+\.?\d*[\*\/]\-?\d+\.?\d*/));
                        modSubEQ.value = false; // reset this flag each pass

                        if (expression.match(/\-?\d+\.?\d*\*\-?\d+\.?\d*/))
                        {
                            // Operator is *
                            subEquation = String(expression.match(/\-?\d+\.?\d*\*\-?\d+\.?\d*/));
                            subEQAnswer = EvaluateSubEQ(subEquation, '*', parenSetMatches[i], modSubEQ)
                        }
                        else
                        {
                            // Operator is /
                            subEquation = String(expression.match(/\-?\d+\.?\d*\/\-?\d+\.?\d*/));
                            subEQAnswer = EvaluateSubEQ(subEquation, '/', parenSetMatches[i], modSubEQ)
                        }

                        if (modSubEQ.value)
                        {
                            subEquation = subEquation.replace(/^./, '');
                        }

                        // Replace subEquation with with subEQAnswer in string and get rid of parentheses
                        parenSetMatches[i] = FormatSolution(parenSetMatches[i], subEquation, subEQAnswer);
                    }
                    // match each set of + or - and surrounding numbers from left to right, evaluate, and replace in sub equation
                    while(parenSetMatches[i].match(/\-?\d+\.?\d*[\+\-]\-?\d+\.?\d*/))
                    {
                        expression = String(parenSetMatches[i].match(/\-?\d+\.?\d*[\+\-]\-?\d+\.?\d*/));
                        modSubEQ.value = false;

                        if (expression.match(/\-?\d+\.?\d*\+\-?\d+\.?\d*/))
                        {
                            // Operator is +
                            subEquation = String(expression.match(/\-?\d+\.?\d*\+\-?\d+\.?\d*/));
                            subEQAnswer = EvaluateSubEQ(subEquation, '+', parenSetMatches[i], modSubEQ)
                        }
                        else
                        {
                            // Operator is -
                            subEquation = String(expression.match(/\-?\d+\.?\d*\-\-?\d+\.?\d*/));
                            subEQAnswer = EvaluateSubEQ(subEquation, '-', parenSetMatches[i], modSubEQ)
                        }

                        if (modSubEQ.value)
                        {
                            subEquation = subEquation.replace(/^./, '');
                        }

                        // Replace subEquation with with subEQAnswer in string and get rid of parentheses
                        parenSetMatches[i] = FormatSolution(parenSetMatches[i], subEquation, subEQAnswer);
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

            // Now evaluate the rest of the equation without parentheses
            answer = equation;

            while(answer.match(/\-?\d+\.?\d*[\*\/]\-?\d+\.?\d*/))
            {
                expression = String(answer.match(/\-?\d+\.?\d*[\*\/]\-?\d+\.?\d*/));
                modSubEQ.value = false; // reset this flag each pass

                if (expression.match(/\-?\d+\.?\d*\*\-?\d+\.?\d*/))
                {
                    // Operator is *
                    subEquation = String(expression.match(/\-?\d+\.?\d*\*\-?\d+\.?\d*/));
                    subEQAnswer = EvaluateSubEQ(subEquation, '*', answer, modSubEQ)
                }
                else
                {
                    // Operator is /
                    subEquation = String(expression.match(/\-?\d+\.?\d*\/\-?\d+\.?\d*/));
                    subEQAnswer = EvaluateSubEQ(subEquation, '/', answer, modSubEQ)
                }

                if (modSubEQ.value)
                {
                    subEquation = subEquation.replace(/^./, '');
                }

                // Replace subEquation with with subEQAnswer in string and get rid of parentheses
                answer = FormatSolution(answer, subEquation, subEQAnswer);

            }

            // match each set of + or - and surrounding numbers from left to right, evaluate, and replace in sub equation
            while(answer.match(/\-?\d+\.?\d*[\+\-]\-?\d+\.?\d*/))
            {
                expression = String(answer.match(/\-?\d+\.?\d*[\+\-]\-?\d+\.?\d*/));
                modSubEQ.value = false;

                if (expression.match(/\-?\d+\.?\d*\+\-?\d+\.?\d*/))
                {
                    // Operator is +
                    subEquation = String(expression.match(/\-?\d+\.?\d*\+\-?\d+\.?\d*/));
                    subEQAnswer = EvaluateSubEQ(subEquation, '+', answer, modSubEQ)
                }
                else
                {
                    // Operator is -
                    subEquation = String(expression.match(/\-?\d+\.?\d*\-\-?\d+\.?\d*/));
                    subEQAnswer = EvaluateSubEQ(subEquation, '-', answer, modSubEQ)
                }

                if (modSubEQ.value)
                {
                    subEquation = subEquation.replace(/^./, '');
                }

                // Replace subEquation with with subEQAnswer in string and get rid of parentheses
                answer = FormatSolution(answer, subEquation, subEQAnswer);
            }

            // Remove the parentheses from the solution
            answer.replace(/\(/, '');
            answer.replace(/\)/, '');

            //answer should now
            console.log("Solution to equation = " + answer);

            return answer;
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

	  return answer;
}

function EvaluateSubEQ(subEQ, operator, fullExpressionOfSubEQ, modSubEQAfterwardsFlag)
{
    var rVal;
    var subSideA = ParseSideA(fullExpressionOfSubEQ, subEQ, modSubEQAfterwardsFlag);
    var subSideB = ParseSideB(subEQ);

    switch (operator)
    {
        case '*':
            rVal = subSideA * subSideB;
            break;
        case '/':
            rVal = subSideA / subSideB;
            break;
        case '+':
            rVal = subSideA + subSideB;
            break;
        case '-':
            rVal = subSideA - subSideB;
            break;
        default:
            rVal = null;
    }

    return rVal;
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

function ParseSideA(fullExpressionOfSubEQ, subEQ, modSubEQ)
{
    var aSide = String(subEQ.match(/^\-?\d+\.?\d*/));
    var tempStr = '';

    //debug
    console.log("Entering ParseSideA. aSide = " + aSide);
    //endOfDebug

    if (aSide.match(/\-/))
    {
        // Then validate that it's a true negative

        if(SideATrueNegative(fullExpressionOfSubEQ, subEQ))
        {
            // Then sideA is a negative number
            console.log("Side A is truly negative");
        }
        else
        {
            // SideA is not a negative number. Remove the "-" from the beginning of the side
            //aSide = aSide.replace(/^./, '');
            console.log("Side A is not negative");
            aSide = String(subEQ.match(/\d+\.?\d*/));
            modSubEQ.value = true;
        }
    }

    return parseFloat(aSide);
}

function ParseSideB(subEQ)
{
    var bSide = String(subEQ.match(/\-?\d+\.?\d*$/));
    var tempStr = '';

    //debug
    console.log("Entering ParseSideB. bSide = " + bSide);
    //endOfDebug

    if (bSide.match(/\-/))
    {
        // Then validate that it's a true negative

        var bSideRegExp = ConvertToRegExp(bSide);
        var tempRegexp = new RegExp('.' + bSideRegExp);

        tempStr = String(subEQ.match(tempRegexp));

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
            //debug
            console.log("Side B is not negative");
            //endOfDebug
        }
    }

    return parseFloat(bSide);
}

function FormatSolution(expr, subEQ, subEQAns)
{
    var rVal = '';

    rVal = expr.replace(subEQ, String(subEQAns));
    rVal = rVal.replace(/\(/, '');
    rVal = rVal.replace(/\)/, '');

    return rVal;
}

function ConvertToRegExp(myString)
{
    var strTemp = String(myString)

    if (strTemp.match(/\*/))
    {
        strTemp = strTemp.replace(/\*/, "\\*");
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
        strTemp = strTemp.replace(/\-/, "\\-");
    }

    return strTemp;
}

function ValidInput(currentInput)
{
    switch(base_mode)
    {
  		case "Decimal":
  			if(currentInput.match(/^[0-9\(\)\+\-\*\/\.]$/))
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
			if(currentEquation.match(/^[0-9\(\)\+\-\*\/\.]+$/)) // Test to see if current equation only contains valid characters
			{
                // Test to see there is no invalid use of decimal points
                console.log("Entering Valid Equation. currentEquation = " + currentEquation);
                if (currentEquation.match(/\./))
                {
                    console.log("Decimal point found");
                    var decimalPointMatches = currentEquation.match(/.\../g);

                    for (var i = 0; i < decimalPointMatches.length; i++)
                    {
                        if (decimalPointMatches[i].match(/\d\.\d/))
                        {
                            console.log("Valid decimal point use");
                            // Then it's a valid use of decimal point
                        }
                        else
                        {
                            console.log("Invalid decimal point use");
                            // Then this is not a vlid use of decimal points
                            errorFlag = ErrorType.InvalidUseOfDecimalPoints;
                            return false;
                        }
                    }
                }

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
                    if(currentEquation.match(/\([\+\-\*\/\.]/))
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
