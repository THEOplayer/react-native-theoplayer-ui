export function fuzzyEquals(number1: number, number2: number, tolerance: number): boolean {
    return number1 === number2 || Math.abs(number1 - number2) <= tolerance;
}