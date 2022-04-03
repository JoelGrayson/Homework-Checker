export function removeSpaces(input: string): string { //for some reason, calendar page and home page have different course names spacing. Removing spaces allows the course to work across the pages. 
    // Different spacing below:
    // "Algebra II (H): ALGEBRA II H - G"
    // "Algebra II (H) : ALGEBRA II H - G "

    let str='';
    for (let character of input)
        if (character!==' ')
            str+=character;
    
    return str;
}