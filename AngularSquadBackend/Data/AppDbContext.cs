using AngularSquadBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace AngularSquadBackend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Barang> Barangs => Set<Barang>();

    public DbSet<User> Users => Set<User>();

    public DbSet<Menu> Menus => Set<Menu>();

    public DbSet<PrivilegeUser> PrivilegeUsers => Set<PrivilegeUser>();

    public DbSet<Dokter> Dokters => Set<Dokter>();

    public DbSet<Pendaftaran> Pendaftarans => Set<Pendaftaran>();

    public DbSet<JadwalOperasi> JadwalOperasis => Set<JadwalOperasi>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Barang>()
            .Property(barang => barang.Harga)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Dokter>(entity =>
        {
            entity.ToTable("table_dokter");
            entity.HasKey(dokter => dokter.IdDokter);
            entity.Property(dokter => dokter.IdDokter).HasColumnName("id_dokter");
            entity.Property(dokter => dokter.NamaDokter).HasColumnName("nama_dokter").HasMaxLength(100);
            entity.Property(dokter => dokter.Keahlian).HasColumnName("keahlian").HasMaxLength(100);
            entity.Property(dokter => dokter.MaxLayananHarian)
                .HasColumnName("max_layanan_harian")
                .HasDefaultValue(50);
            entity.Property(dokter => dokter.StatusAktif)
                .HasColumnName("status_aktif")
                .HasColumnType("enum('Aktif','Nonaktif')")
                .HasDefaultValue("Aktif");
        });

        modelBuilder.Entity<Pendaftaran>(entity =>
        {
            entity.ToTable("table_pendaftaran");
            entity.HasKey(pendaftaran => pendaftaran.IdPendaftaran);
            entity.Property(pendaftaran => pendaftaran.IdPendaftaran).HasColumnName("id_pendaftaran");
            entity.Property(pendaftaran => pendaftaran.IdPasien).HasColumnName("id_pasien");
            entity.Property(pendaftaran => pendaftaran.IdDokter).HasColumnName("id_dokter");
            entity.Property(pendaftaran => pendaftaran.TanggalDaftar).HasColumnName("tanggal_daftar");
            entity.Property(pendaftaran => pendaftaran.JenisLayanan)
                .HasColumnName("jenis_layanan")
                .HasColumnType("enum('Rawat Jalan','Rawat Inap','Operasi')");
            entity.Property(pendaftaran => pendaftaran.StatusValidasi)
                .HasColumnName("status_validasi")
                .HasColumnType("enum('Pending','Approved','Rejected')")
                .HasDefaultValue("Pending");
            entity.HasOne(pendaftaran => pendaftaran.Dokter)
                .WithMany(dokter => dokter.Pendaftarans)
                .HasForeignKey(pendaftaran => pendaftaran.IdDokter)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<JadwalOperasi>(entity =>
        {
            entity.ToTable("table_jadwal_operasi");
            entity.HasKey(jadwal => jadwal.IdJadwalOperasi);
            entity.Property(jadwal => jadwal.IdJadwalOperasi).HasColumnName("id_jadwal_operasi");
            entity.Property(jadwal => jadwal.IdPendaftaran).HasColumnName("id_pendaftaran");
            entity.Property(jadwal => jadwal.IdRuangOperasi).HasColumnName("id_ruang_operasi");
            entity.Property(jadwal => jadwal.IdDokter).HasColumnName("id_dokter");
            entity.Property(jadwal => jadwal.TanggalOperasi).HasColumnName("tanggal_operasi");
            entity.Property(jadwal => jadwal.JamMulai).HasColumnName("jam_mulai");
            entity.Property(jadwal => jadwal.JamSelesai).HasColumnName("jam_selesai");
            entity.Property(jadwal => jadwal.StatusOperasi)
                .HasColumnName("status_operasi")
                .HasColumnType("enum('Terjadwal','Selesai','Batal')")
                .HasDefaultValue("Terjadwal");
            entity.HasOne(jadwal => jadwal.Pendaftaran)
                .WithMany(pendaftaran => pendaftaran.JadwalOperasis)
                .HasForeignKey(jadwal => jadwal.IdPendaftaran)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(jadwal => jadwal.Dokter)
                .WithMany(dokter => dokter.JadwalOperasis)
                .HasForeignKey(jadwal => jadwal.IdDokter)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Menu>(entity =>
        {
            entity.ToTable("table_menu");
            entity.HasKey(menu => menu.Id);
            entity.Property(menu => menu.Id).HasColumnName("id");
            entity.Property(menu => menu.MenuName).HasColumnName("menu_name");
            entity.Property(menu => menu.UrlMenu).HasColumnName("url_menu");
            entity.Property(menu => menu.ParentId).HasColumnName("parent_id");
            entity.Property(menu => menu.IsActive).HasColumnName("is_active");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("table_user");
            entity.HasKey(user => user.Id);
            entity.Property(user => user.Id).HasColumnName("id");
            entity.Property(user => user.Username).HasColumnName("username");
            entity.Property(user => user.FullName).HasColumnName("name");
            entity.Property(user => user.Email).HasColumnName("email");
            entity.Property(user => user.Role).HasColumnName("role");
            entity.Property(user => user.PasswordHash).HasColumnName("password_hash");
            entity.HasIndex(user => user.Username).IsUnique();
        });

        modelBuilder.Entity<PrivilegeUser>()
            .HasOne(privilege => privilege.User)
            .WithMany()
            .HasForeignKey(privilege => privilege.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PrivilegeUser>()
            .HasOne(privilege => privilege.Menu)
            .WithMany()
            .HasForeignKey(privilege => privilege.MenuId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
