import os

folder = "datasets/train"

mudras = set()

for file in os.listdir(folder):

    if "_" in file:
        mudra = file.split("_")[1]
        mudras.add(mudra)

for m in sorted(mudras):
    print(m)

print("\nTotal Mudras:", len(mudras))