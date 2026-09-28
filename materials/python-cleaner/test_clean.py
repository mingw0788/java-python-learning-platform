import csv
import tempfile
import unittest
from pathlib import Path
from clean import clean


class CleanTests(unittest.TestCase):
    def test_sample_and_repeat(self):
        with tempfile.TemporaryDirectory() as root:
            target = Path(root)
            sample = Path(__file__).with_name("scores.csv")
            self.assertEqual(clean(sample, target), (2, 4))
            self.assertEqual(clean(sample, target), (2, 4))
            with (target / "valid.csv").open(encoding="utf-8", newline="") as f:
                self.assertEqual(len(list(csv.DictReader(f))), 2)

    def test_missing_headers(self):
        with tempfile.TemporaryDirectory() as root:
            source = Path(root) / "input.csv"
            source.write_text("name\nLin\n", encoding="utf-8")
            with self.assertRaises(ValueError):
                clean(source, Path(root) / "out")


if __name__ == "__main__":
    unittest.main()
