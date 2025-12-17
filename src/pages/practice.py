# ----------------------------------------
# Simple Python Program with Many Lines
# ----------------------------------------

# This program demonstrates basic Python concepts
# such as variables, loops, functions, and conditions

# ----------------------------------------
# Function to greet the user
# ----------------------------------------
def greet_user():
    print("Hello!")
    print("Welcome to this simple Python program.")
    print("This program is written with many lines.")
    print("It is easy to understand.")
    print("----------------------------------------")


# ----------------------------------------
# Function to add two numbers
# ----------------------------------------
def add_numbers(a, b):
    result = a + b
    return result


# ----------------------------------------
# Function to check even or odd
# ----------------------------------------
def check_even_odd(number):
    if number % 2 == 0:
        print(number, "is an even number.")
    else:
        print(number, "is an odd number.")


# ----------------------------------------
# Main program starts here
# ----------------------------------------
def main():

    # Greet the user
    greet_user()

    # Define numbers
    num1 = 10
    num2 = 5

    # Print the numbers
    print("First number:", num1)
    print("Second number:", num2)

    # Add the numbers
    sum_result = add_numbers(num1, num2)

    # Print the result
    print("Sum of the two numbers:", sum_result)

    print("----------------------------------------")

    # Check even or odd for numbers from 1 to 5
    for i in range(1, 6):
        print("Checking number:", i)
        check_even_odd(i)
        print("----------------------------------------")

    # End message
    print("Program execution completed.")
    print("Thank you for using this program.")


# ----------------------------------------
# Run the main function
# ----------------------------------------
main()
