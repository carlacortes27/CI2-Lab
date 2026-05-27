import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;

public class H2AuthBridge {
  private static final String SCHEMA_SQL = """
      CREATE TABLE IF NOT EXISTS USERS (
        ID BIGINT AUTO_INCREMENT PRIMARY KEY,
        NAME VARCHAR(100) NOT NULL,
        EMAIL VARCHAR(150) NOT NULL UNIQUE,
        PASSWORD_HASH VARCHAR(255) NOT NULL,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      """;

  public static void main(String[] args) throws Exception {
    if (args.length < 2) {
      throw new IllegalArgumentException("Usage: H2AuthBridge <command> <jdbcUrl> [args...]");
    }

    Class.forName("org.h2.Driver");
    String command = args[0];
    String jdbcUrl = args[1];

    try (Connection conn = DriverManager.getConnection(jdbcUrl, "sa", "")) {
      switch (command) {
        case "init" -> init(conn);
        case "findByEmail" -> findByEmail(conn, args[2]);
        case "findById" -> findById(conn, Long.parseLong(args[2]));
        case "createUser" -> createUser(conn, args[2], args[3], args[4]);
        case "listUsers" -> listUsers(conn);
        default -> throw new IllegalArgumentException("Unknown command: " + command);
      }
    }
  }

  private static void init(Connection conn) throws Exception {
    try (Statement stmt = conn.createStatement()) {
      stmt.execute(SCHEMA_SQL);
    }
    migrateLowercaseUsersIfPresent(conn);
    System.out.println("{\"ok\":true}");
  }

  private static void migrateLowercaseUsersIfPresent(Connection conn) {
    try (Statement stmt = conn.createStatement()) {
      stmt.executeUpdate("""
          INSERT INTO USERS (NAME, EMAIL, PASSWORD_HASH, CREATED_AT)
          SELECT name, email, password_hash, created_at
          FROM users
          WHERE NOT EXISTS (
            SELECT 1 FROM USERS WHERE LOWER(USERS.EMAIL) = LOWER(users.email)
          )
          """);
    } catch (Exception ignored) {
      // No previous lowercase table exists, or it already has incompatible data.
    }
  }

  private static void findByEmail(Connection conn, String email) throws Exception {
    try (PreparedStatement stmt = conn.prepareStatement(
        "SELECT ID, NAME, EMAIL, PASSWORD_HASH, CREATED_AT FROM USERS WHERE LOWER(EMAIL) = LOWER(?)")) {
      stmt.setString(1, email);
      try (ResultSet rs = stmt.executeQuery()) {
        printUserOrNull(rs, true);
      }
    }
  }

  private static void findById(Connection conn, long id) throws Exception {
    try (PreparedStatement stmt = conn.prepareStatement(
        "SELECT ID, NAME, EMAIL, PASSWORD_HASH, CREATED_AT FROM USERS WHERE ID = ?")) {
      stmt.setLong(1, id);
      try (ResultSet rs = stmt.executeQuery()) {
        printUserOrNull(rs, false);
      }
    }
  }

  private static void createUser(Connection conn, String name, String email, String passwordHash) throws Exception {
    try (PreparedStatement stmt = conn.prepareStatement(
        "INSERT INTO USERS (NAME, EMAIL, PASSWORD_HASH) VALUES (?, ?, ?)",
        Statement.RETURN_GENERATED_KEYS)) {
      stmt.setString(1, name);
      stmt.setString(2, email);
      stmt.setString(3, passwordHash);
      stmt.executeUpdate();

      try (ResultSet keys = stmt.getGeneratedKeys()) {
        if (!keys.next()) {
          throw new IllegalStateException("No generated id returned");
        }
        findById(conn, keys.getLong(1));
      }
    }
  }

  private static void listUsers(Connection conn) throws Exception {
    try (PreparedStatement stmt = conn.prepareStatement(
        "SELECT ID, NAME, EMAIL, PASSWORD_HASH, CREATED_AT FROM USERS ORDER BY ID")) {
      try (ResultSet rs = stmt.executeQuery()) {
        StringBuilder json = new StringBuilder("[");
        boolean first = true;

        while (rs.next()) {
          if (!first) json.append(",");
          first = false;
          json.append(userJson(rs, true));
        }

        json.append("]");
        System.out.println(json);
      }
    }
  }

  private static void printUserOrNull(ResultSet rs, boolean includePasswordHash) throws Exception {
    if (!rs.next()) {
      System.out.println("null");
      return;
    }

    System.out.println(userJson(rs, includePasswordHash));
  }

  private static String userJson(ResultSet rs, boolean includePasswordHash) throws Exception {
    return "{"
        + "\"id\":" + rs.getLong("ID") + ","
        + "\"name\":\"" + escape(rs.getString("NAME")) + "\","
        + "\"email\":\"" + escape(rs.getString("EMAIL")) + "\","
        + (includePasswordHash ? "\"passwordHash\":\"" + escape(rs.getString("PASSWORD_HASH")) + "\"," : "")
        + "\"createdAt\":\"" + formatTimestamp(rs.getTimestamp("CREATED_AT")) + "\""
        + "}";
  }

  private static String formatTimestamp(Timestamp timestamp) {
    return timestamp == null ? "" : timestamp.toInstant().toString();
  }

  private static String escape(String value) {
    if (value == null) return "";
    return value
        .replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t");
  }
}
