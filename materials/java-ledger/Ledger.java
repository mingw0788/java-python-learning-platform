import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

/** Reference implementation. Input is TSV (not CSV); id and name cannot contain tabs. */
public class Ledger {
    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            System.err.println("用法：java Ledger devices.tsv");
            System.exit(2);
        }
        List<String> lines = Files.readAllLines(Path.of(args[0]), StandardCharsets.UTF_8);
        if (lines.isEmpty() || !lines.get(0).replace("\uFEFF", "").equals("id\tname")) {
            throw new IllegalArgumentException("输入表头必须为 id TAB name");
        }
        Map<String, String> devices = new LinkedHashMap<>();
        List<String> errors = new ArrayList<>();
        for (int i = 1; i < lines.size(); i++) {
            String[] cells = lines.get(i).split("\t", -1);
            int row = i + 1;
            if (cells.length != 2) { errors.add("第 " + row + " 行：列数不符"); continue; }
            String id = cells[0].trim(), name = cells[1].trim();
            if (id.isEmpty() || name.isEmpty()) { errors.add("第 " + row + " 行：编号或名称为空"); continue; }
            if (devices.containsKey(id)) { errors.add("第 " + row + " 行：重复编号 " + id); continue; }
            devices.put(id, name);
        }
        System.out.println("有效=" + devices.size() + " 错误=" + errors.size());
        devices.forEach((id, name) -> System.out.println(id + "\t" + name));
        errors.forEach(System.err::println);
    }
}
