import sys
import urllib.parse
import urllib.request
from urllib.error import HTTPError, URLError
import json



class ColoredText:
    """Colored text class"""
    colors = ['black', 'red', 'green', 'orange', 'blue', 'magenta', 'cyan', 'white']
    color_dict = {}
    for i, c in enumerate(colors):
        color_dict[c] = (i + 30, i + 40)

    @classmethod
    def colorize(cls, text, color=None, bgcolor=None):
        """Colorize text
        @param cls Class
        @param text Text
        @param color Text color
        @param bgcolor Background color
        """
        c = None
        bg = None
        gap = 0
        if color is not None:
            try:
                c = cls.color_dict[color][0]
            except KeyError:
                print("Invalid text color:", color)
                return(text, gap)

        if bgcolor is not None:
            try:
                bg = cls.color_dict[bgcolor][1]
            except KeyError:
                print("Invalid background color:", bgcolor)
                return(text, gap)

        s_open, s_close = '', ''
        if c is not None:
            s_open = '\033[%dm' % c
            gap = len(s_open)
        if bg is not None:
            s_open += '\033[%dm' % bg
            gap = len(s_open)
        if not c is None or bg is None:
            s_close = '\033[0m'
            gap += len(s_close)
        return('%s%s%s' % (s_open, text, s_close), gap)


def get_language_tool_url(text):
    """Get URL for checking grammar using LanguageTool.
    @param text English text
    @return URL
    """
    base_url = "https://languagetool.org/api/v2/check"
    params = {
        "text": text,
        "language": "en-US",
    }
    return base_url + "?" + urllib.parse.urlencode(params)


def get_language_tool_result(text):
    """Get result of checking grammar using LanguageTool.
    @param text English text
    @return result of grammar check by LanguageTool
    """
    url = get_language_tool_url(text)

    try:
        response = urllib.request.urlopen(url)
    except HTTPError as e:
        print("HTTP Error:", e.code)
        quit()
    except URLError as e:
        print("URL Error:", e.reason)
        quit()

    try:
        result = json.loads(response.read().decode('utf-8'))
    except ValueError:
        print("Value Error: Invalid server response.")
        quit()

    return result


class Janu:
    def __init__(self):
        self.name = "janu"  # AI's name
        

    def generate_response(self, message):
        for trigger, response in self.dataset:
            if trigger.lower() in message.lower():
                return response
        if self.name.lower() in message.lower():
            return f"My name is {self.name}, spelled P-E-R-R-Y."
        return "I'm sorry, I didn't understand that."

    def correct_grammar(self, message):
        result = get_language_tool_result(message)
        if 'matches' not in result or not result['matches']:
            return message  # No grammar mistakes found
        else:
            # Correct grammar
            corrected_text = message
            for error in result['matches']:
                from_index = error['offset']
                to_index = from_index + error['length']
                suggested_correction = error['replacements'][0]['value']
                corrected_text = corrected_text[:from_index] + suggested_correction + corrected_text[to_index:]
            return corrected_text


# Instantiate the AI object
janu = Janu()

# Get message from command line arguments
message = " ".join(sys.argv[1:])

# Generate response and print it
response = janu.generate_response(message)
if response == "I'm sorry, I didn't understand that.":
    corrected_message = janu.correct_grammar(message)
    print("Sorry     my        dear    your    communication     very       poor    here     is        a      proper      communication ")
    print(corrected_message)
else:
    print(response)
