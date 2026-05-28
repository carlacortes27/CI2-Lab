import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;

public class H2AuthBridge {
  private static final String USERS_SCHEMA_SQL = """
      CREATE TABLE IF NOT EXISTS USERS (
        ID BIGINT AUTO_INCREMENT PRIMARY KEY,
        NAME VARCHAR(100) NOT NULL,
        EMAIL VARCHAR(150) NOT NULL UNIQUE,
        PASSWORD_HASH VARCHAR(255) NOT NULL,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      """;
  private static final String APPLICATIONS_SCHEMA_SQL = """
      CREATE TABLE IF NOT EXISTS APPLICATIONS (
        ID BIGINT AUTO_INCREMENT PRIMARY KEY,
        USER_ID BIGINT NOT NULL,
        OFFER_ID VARCHAR(80) NOT NULL,
        STATUS VARCHAR(30) NOT NULL DEFAULT 'enviada',
        CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FK_APPLICATIONS_USER FOREIGN KEY (USER_ID) REFERENCES USERS(ID),
        CONSTRAINT UQ_APPLICATIONS_USER_OFFER UNIQUE (USER_ID, OFFER_ID)
      )
      """;

  private static final String[] APPLICATION_PHASES = {
      "enviada", "revision", "entrevista", "aceptada", "finalizada"
  };

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
        case "listApplications" -> listApplications(conn, Long.parseLong(args[2]));
        case "createApplication" -> createApplication(conn, Long.parseLong(args[2]), args[3]);
        case "saveApplication" -> saveApplication(conn, Long.parseLong(args[2]), args[3]);
        case "advanceApplication" -> advanceApplication(conn, Long.parseLong(args[2]), Long.parseLong(args[3]));
        case "rejectApplication" -> rejectApplication(conn, Long.parseLong(args[2]), Long.parseLong(args[3]));
        default -> throw new IllegalArgumentException("Unknown command: " + command);
      }
    }
  }

  private static void init(Connection conn) throws Exception {
    try (Statement stmt = conn.createStatement()) {
      stmt.execute(USERS_SCHEMA_SQL);
      stmt.execute(APPLICATIONS_SCHEMA_SQL);
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

  private static void listApplications(Connection conn, long userId) throws Exception {
    try (PreparedStatement stmt = conn.prepareStatement(
        "SELECT ID, USER_ID, OFFER_ID, STATUS, CREATED_AT, UPDATED_AT FROM APPLICATIONS WHERE USER_ID = ? ORDER BY CREATED_AT DESC, ID DESC")) {
      stmt.setLong(1, userId);
      try (ResultSet rs = stmt.executeQuery()) {
        StringBuilder json = new StringBuilder("[");
        boolean first = true;

        while (rs.next()) {
          if (!first) json.append(",");
          first = false;
          json.append(applicationJson(rs));
        }

        json.append("]");
        System.out.println(json);
      }
    }
  }

  private static void createApplication(Connection conn, long userId, String offerId) throws Exception {
    try (PreparedStatement stmt = conn.prepareStatement(
        "INSERT INTO APPLICATIONS (USER_ID, OFFER_ID, STATUS) VALUES (?, ?, 'enviada')",
        Statement.RETURN_GENERATED_KEYS)) {
      stmt.setLong(1, userId);
      stmt.setString(2, offerId);
      stmt.executeUpdate();

      try (ResultSet keys = stmt.getGeneratedKeys()) {
        if (!keys.next()) throw new IllegalStateException("No generated id returned");
        findApplicationById(conn, keys.getLong(1), userId);
      }
    } catch (org.h2.jdbc.JdbcSQLIntegrityConstraintViolationException duplicate) {
      try (PreparedStatement stmt = conn.prepareStatement(
          "UPDATE APPLICATIONS SET STATUS = 'enviada', UPDATED_AT = CURRENT_TIMESTAMP WHERE USER_ID = ? AND OFFER_ID = ? AND STATUS = 'guardada'")) {
        stmt.setLong(1, userId);
        stmt.setString(2, offerId);
        stmt.executeUpdate();
      }
      findApplicationByOffer(conn, userId, offerId);
    }
  }

  private static void saveApplication(Connection conn, long userId, String offerId) throws Exception {
    try (PreparedStatement stmt = conn.prepareStatement(
        "INSERT INTO APPLICATIONS (USER_ID, OFFER_ID, STATUS) VALUES (?, ?, 'guardada')",
        Statement.RETURN_GENERATED_KEYS)) {
      stmt.setLong(1, userId);
      stmt.setString(2, offerId);
      stmt.executeUpdate();

      try (ResultSet keys = stmt.getGeneratedKeys()) {
        if (!keys.next()) throw new IllegalStateException("No generated id returned");
        findApplicationById(conn, keys.getLong(1), userId);
      }
    } catch (org.h2.jdbc.JdbcSQLIntegrityConstraintViolationException duplicate) {
      findApplicationByOffer(conn, userId, offerId);
    }
  }

  private static void advanceApplication(Connection conn, long applicationId, long userId) throws Exception {
    String currentStatus = null;
    try (PreparedStatement stmt = conn.prepareStatement(
        "SELECT STATUS FROM APPLICATIONS WHERE ID = ? AND USER_ID = ?")) {
      stmt.setLong(1, applicationId);
      stmt.setLong(2, userId);
      try (ResultSet rs = stmt.executeQuery()) {
        if (rs.next()) currentStatus = rs.getString("STATUS");
      }
    }

    if (currentStatus == null) {
      System.out.println("null");
      return;
    }

    String nextStatus = nextPhase(currentStatus);
    try (PreparedStatement stmt = conn.prepareStatement(
        "UPDATE APPLICATIONS SET STATUS = ?, UPDATED_AT = CURRENT_TIMESTAMP WHERE ID = ? AND USER_ID = ?")) {
      stmt.setString(1, nextStatus);
      stmt.setLong(2, applicationId);
      stmt.setLong(3, userId);
      stmt.executeUpdate();
    }
    findApplicationById(conn, applicationId, userId);
  }

  private static void rejectApplication(Connection conn, long applicationId, long userId) throws Exception {
    try (PreparedStatement stmt = conn.prepareStatement(
        "UPDATE APPLICATIONS SET STATUS = 'rechazada', UPDATED_AT = CURRENT_TIMESTAMP WHERE ID = ? AND USER_ID = ?")) {
      stmt.setLong(1, applicationId);
      stmt.setLong(2, userId);
      int updated = stmt.executeUpdate();
      if (updated == 0) {
        System.out.println("null");
        return;
      }
    }
    findApplicationById(conn, applicationId, userId);
  }

  private static String nextPhase(String status) {
    for (int i = 0; i < APPLICATION_PHASES.length; i++) {
      if (APPLICATION_PHASES[i].equals(status)) {
        return APPLICATION_PHASES[Math.min(i + 1, APPLICATION_PHASES.length - 1)];
      }
    }
    return APPLICATION_PHASES[0];
  }

  private static void findApplicationByOffer(Connection conn, long userId, String offerId) throws Exception {
    try (PreparedStatement stmt = conn.prepareStatement(
        "SELECT ID, USER_ID, OFFER_ID, STATUS, CREATED_AT, UPDATED_AT FROM APPLICATIONS WHERE USER_ID = ? AND OFFER_ID = ?")) {
      stmt.setLong(1, userId);
      stmt.setString(2, offerId);
      try (ResultSet rs = stmt.executeQuery()) {
        printApplicationOrNull(rs);
      }
    }
  }

  private static void findApplicationById(Connection conn, long applicationId, long userId) throws Exception {
    try (PreparedStatement stmt = conn.prepareStatement(
        "SELECT ID, USER_ID, OFFER_ID, STATUS, CREATED_AT, UPDATED_AT FROM APPLICATIONS WHERE ID = ? AND USER_ID = ?")) {
      stmt.setLong(1, applicationId);
      stmt.setLong(2, userId);
      try (ResultSet rs = stmt.executeQuery()) {
        printApplicationOrNull(rs);
      }
    }
  }

  private static void printApplicationOrNull(ResultSet rs) throws Exception {
    if (!rs.next()) {
      System.out.println("null");
      return;
    }
    System.out.println(applicationJson(rs));
  }

  private static String applicationJson(ResultSet rs) throws Exception {
    return "{"
        + "\"id\":" + rs.getLong("ID") + ","
        + "\"userId\":" + rs.getLong("USER_ID") + ","
        + "\"offerId\":\"" + escape(rs.getString("OFFER_ID")) + "\","
        + "\"status\":\"" + escape(rs.getString("STATUS")) + "\","
        + "\"createdAt\":\"" + formatTimestamp(rs.getTimestamp("CREATED_AT")) + "\","
        + "\"updatedAt\":\"" + formatTimestamp(rs.getTimestamp("UPDATED_AT")) + "\""
        + "}";
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
    StringBuilder escaped = new StringBuilder();
    for (int i = 0; i < value.length(); i++) {
      char c = value.charAt(i);
      switch (c) {
        case '\\' -> escaped.append("\\\\");
        case '"' -> escaped.append("\\\"");
        case '\n' -> escaped.append("\\n");
        case '\r' -> escaped.append("\\r");
        case '\t' -> escaped.append("\\t");
        default -> {
          if (c < 0x20 || c > 0x7E) {
            escaped.append(String.format("\\u%04x", (int) c));
          } else {
            escaped.append(c);
          }
        }
      }
    }
    return escaped.toString();
  }
}
