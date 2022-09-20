import argparse
import base64

from handler import create_pdf, modify_data

default_data = {
    "date": "11-03-2020",
    "amount": "153",
    "name": "Lar",
    "accountNumber": "010101010101",
    "committee": "Komkom",
    "occasion": "Teste litt",
    "comment": "pls",
}


def main(data, out):
    data = modify_data(data)

    pdf = create_pdf(data)

    with open(out, "wb") as f:
        f.write(pdf.encode("latin-1"))

    print("Done!")


def encode_image(img):
    with open(img, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f'data:image/{img.split(".")[-1]};base64,{b64}'


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("signature", help="Path to signature")
    parser.add_argument("out", help="Path to the generated pdf")
    parser.add_argument(
        "images", nargs=argparse.REMAINDER, default=[], help="Paths to images"
    )
    args = parser.parse_args()

    data = {
        **default_data,
        "signature": encode_image(args.signature),
        "images": [encode_image(img) for img in args.images],
    }

    main(data, args.out)
