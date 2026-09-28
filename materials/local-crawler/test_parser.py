import unittest
from collect import CourseParser


class ParserTests(unittest.TestCase):
    def test_title_and_id(self):
        parser = CourseParser()
        parser.feed('<article data-id="1"><h2> 测试课程 </h2></article>')
        self.assertEqual(parser.rows, [{"id": "1", "title": "测试课程"}])

    def test_missing_title_preserved_for_validation(self):
        parser = CourseParser()
        parser.feed('<article data-id="1"></article>')
        self.assertEqual(parser.rows[0]["title"], "")


if __name__ == "__main__":
    unittest.main()
