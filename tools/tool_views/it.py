import base64
import binascii
import re

from urllib.parse import quote, quote_plus, unquote, unquote_plus

from django.shortcuts import render, get_object_or_404

from ..models import ToolPage

MAX_BASE64_INPUT_LENGTH = 200_000

BASE64_OPERATIONS = {
    'encode': 'Кодировать в Base64',
    'decode': 'Декодировать из Base64',
}

BASE64_VARIANTS = {
    'standard': 'Обычный Base64',
    'urlsafe': 'URL-safe Base64',
}

BASE64_ENCODINGS = {
    'utf-8': 'UTF-8',
    'windows-1251': 'Windows-1251',
    'iso-8859-1': 'ISO-8859-1',
}


def normalize_base64_padding(value):
    missing_padding = len(value) % 4

    if missing_padding:
        value += '=' * (4 - missing_padding)

    return value


def wrap_base64_text(value, line_length=76):
    if not value:
        return value

    return '\n'.join(
        value[index:index + line_length]
        for index in range(0, len(value), line_length)
    )


def base64_converter(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='base64-converter',
            is_published=True
        )

    selected_operation = 'encode'
    selected_variant = 'standard'
    selected_encoding = 'utf-8'
    input_text = ''
    result_text = ''
    error_message = ''
    success_message = ''
    wrap_lines = False
    ignore_spaces = True

    if request.method == 'POST':
        selected_operation = request.POST.get('operation', 'encode')
        selected_variant = request.POST.get('variant', 'standard')
        selected_encoding = request.POST.get('encoding', 'utf-8')
        input_text = request.POST.get('input_text', '')
        wrap_lines = request.POST.get('wrap_lines') == 'on'
        ignore_spaces = request.POST.get('ignore_spaces') == 'on'

        if selected_operation not in BASE64_OPERATIONS:
            selected_operation = 'encode'

        if selected_variant not in BASE64_VARIANTS:
            selected_variant = 'standard'

        if selected_encoding not in BASE64_ENCODINGS:
            selected_encoding = 'utf-8'

        if len(input_text) > MAX_BASE64_INPUT_LENGTH:
            error_message = f'Слишком большой текст. Максимум {MAX_BASE64_INPUT_LENGTH} символов.'
        elif not input_text:
            error_message = 'Введите текст или Base64-строку.'
        else:
            try:
                if selected_operation == 'encode':
                    source_bytes = input_text.encode(selected_encoding)

                    if selected_variant == 'urlsafe':
                        encoded_bytes = base64.urlsafe_b64encode(source_bytes)
                    else:
                        encoded_bytes = base64.b64encode(source_bytes)

                    result_text = encoded_bytes.decode('ascii')

                    if wrap_lines:
                        result_text = wrap_base64_text(result_text)

                    success_message = 'Текст успешно закодирован в Base64.'

                else:
                    source_value = input_text.strip()

                    if ignore_spaces:
                        source_value = re.sub(r'\s+', '', source_value)

                    source_value = normalize_base64_padding(source_value)

                    if selected_variant == 'urlsafe':
                        decoded_bytes = base64.urlsafe_b64decode(
                            source_value.encode('ascii')
                        )
                    else:
                        decoded_bytes = base64.b64decode(
                            source_value.encode('ascii'),
                            validate=True
                        )

                    result_text = decoded_bytes.decode(selected_encoding)
                    success_message = 'Base64 успешно декодирован в текст.'

            except UnicodeEncodeError:
                error_message = f'Текст не удалось закодировать в выбранной кодировке: {BASE64_ENCODINGS[selected_encoding]}.'
            except UnicodeDecodeError:
                error_message = f'Base64 декодирован, но результат не является текстом в кодировке {BASE64_ENCODINGS[selected_encoding]}.'
            except (binascii.Error, ValueError):
                error_message = 'Некорректная Base64-строка. Проверьте символы, длину строки и выбранный тип Base64.'
            except Exception:
                error_message = 'Не удалось обработать данные. Проверьте введённый текст и настройки.'

    context = {
        'page': page,

        'operations': BASE64_OPERATIONS,
        'variants': BASE64_VARIANTS,
        'encodings': BASE64_ENCODINGS,

        'selected_operation': selected_operation,
        'selected_variant': selected_variant,
        'selected_encoding': selected_encoding,

        'input_text': input_text,
        'result_text': result_text,

        'wrap_lines': wrap_lines,
        'ignore_spaces': ignore_spaces,

        'error_message': error_message,
        'success_message': success_message,
        'max_input_length': MAX_BASE64_INPUT_LENGTH,
    }

    return render(
        request,
        'tools/it/base64_converter.html',
        context
    )

MAX_URL_INPUT_LENGTH = 200_000

URL_OPERATIONS = {
    'encode': 'Кодировать',
    'decode': 'Декодировать',
}

URL_MODES = {
    'component': 'Компонент URL',
    'url': 'URL целиком',
    'form': 'Form URL Encoded',
}

URL_ENCODINGS = {
    'utf-8': 'UTF-8',
    'windows-1251': 'Windows-1251',
    'iso-8859-1': 'ISO-8859-1',
}


def encode_url_value(value, mode, encoding):
    if mode == 'form':
        return quote_plus(
            value,
            safe='',
            encoding=encoding,
            errors='strict'
        )

    if mode == 'url':
        return quote(
            value,
            safe=":/?#[]@!$&'()*+,;=-_.~",
            encoding=encoding,
            errors='strict'
        )

    return quote(
        value,
        safe='-_.~',
        encoding=encoding,
        errors='strict'
    )


def decode_url_value(value, mode, encoding):
    if mode == 'form':
        return unquote_plus(
            value,
            encoding=encoding,
            errors='strict'
        )

    return unquote(
        value,
        encoding=encoding,
        errors='strict'
    )


def recursive_url_decode(value, mode, encoding, max_depth=16):
    current_value = value

    for _ in range(max_depth):
        decoded_value = decode_url_value(
            current_value,
            mode,
            encoding
        )

        if decoded_value == current_value:
            break

        current_value = decoded_value

    return current_value


def process_url_text(input_text, operation, mode, encoding, each_line, recursive_decode):
    if each_line:
        lines = input_text.splitlines()

        processed_lines = []

        for line in lines:
            if operation == 'encode':
                processed_lines.append(
                    encode_url_value(
                        line,
                        mode,
                        encoding
                    )
                )
            else:
                if recursive_decode:
                    processed_lines.append(
                        recursive_url_decode(
                            line,
                            mode,
                            encoding
                        )
                    )
                else:
                    processed_lines.append(
                        decode_url_value(
                            line,
                            mode,
                            encoding
                        )
                    )

        return '\n'.join(processed_lines)

    if operation == 'encode':
        return encode_url_value(
            input_text,
            mode,
            encoding
        )

    if recursive_decode:
        return recursive_url_decode(
            input_text,
            mode,
            encoding
        )

    return decode_url_value(
        input_text,
        mode,
        encoding
    )


def url_encoder_decoder(request, page=None):
    if page is None:
        page = get_object_or_404(
            ToolPage,
            slug='url-encoder-decoder',
            is_published=True
        )

    selected_operation = 'decode'
    selected_mode = 'component'
    selected_encoding = 'utf-8'

    input_text = ''
    result_text = ''

    each_line = False
    recursive_decode = False

    error_message = ''
    success_message = ''

    if request.method == 'POST':
        selected_operation = request.POST.get('operation', 'decode')
        selected_mode = request.POST.get('mode', 'component')
        selected_encoding = request.POST.get('encoding', 'utf-8')

        input_text = request.POST.get('input_text', '')

        each_line = request.POST.get('each_line') == 'on'
        recursive_decode = request.POST.get('recursive_decode') == 'on'

        if selected_operation not in URL_OPERATIONS:
            selected_operation = 'decode'

        if selected_mode not in URL_MODES:
            selected_mode = 'component'

        if selected_encoding not in URL_ENCODINGS:
            selected_encoding = 'utf-8'

        if len(input_text) > MAX_URL_INPUT_LENGTH:
            error_message = f'Слишком большой текст. Максимум {MAX_URL_INPUT_LENGTH} символов.'
        elif not input_text:
            error_message = 'Введите текст, ссылку или URL-кодированную строку.'
        else:
            try:
                result_text = process_url_text(
                    input_text=input_text,
                    operation=selected_operation,
                    mode=selected_mode,
                    encoding=selected_encoding,
                    each_line=each_line,
                    recursive_decode=recursive_decode,
                )

                if selected_operation == 'encode':
                    success_message = 'Текст успешно закодирован в URL-формат.'
                else:
                    success_message = 'URL-строка успешно декодирована.'

            except UnicodeEncodeError:
                error_message = f'Не удалось закодировать текст в выбранной кодировке: {URL_ENCODINGS[selected_encoding]}.'
            except UnicodeDecodeError:
                error_message = f'Не удалось декодировать строку в выбранной кодировке: {URL_ENCODINGS[selected_encoding]}.'
            except Exception:
                error_message = 'Не удалось обработать данные. Проверьте строку, режим и кодировку.'

    context = {
        'page': page,

        'operations': URL_OPERATIONS,
        'modes': URL_MODES,
        'encodings': URL_ENCODINGS,

        'selected_operation': selected_operation,
        'selected_mode': selected_mode,
        'selected_encoding': selected_encoding,

        'input_text': input_text,
        'result_text': result_text,

        'each_line': each_line,
        'recursive_decode': recursive_decode,

        'error_message': error_message,
        'success_message': success_message,
        'max_input_length': MAX_URL_INPUT_LENGTH,
    }

    return render(
        request,
        'tools/it/url_encoder_decoder.html',
        context
    )