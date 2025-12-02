CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ"
VOWELS = "AEIOU"
NUMBERS = "0123456789"


def generate_love_code(db_id: int) -> str:
    M = 1102500
    safe_id = (db_id * 812741 + 56789) % M

    temp = safe_id
    digit5 = temp % 10
    temp //= 10
    digit4 = temp % 5
    temp //= 5
    digit3 = temp % 21
    temp //= 21
    digit2 = temp % 10
    temp //= 10
    digit1 = temp % 5
    temp //= 5
    digit0 = temp % 21

    return (
        CONSONANTS[digit0]
        + VOWELS[digit1]
        + NUMBERS[digit2]
        + CONSONANTS[digit3]
        + VOWELS[digit4]
        + NUMBERS[digit5]
    )
