namespace AngularSquadBackend.Models;

public class Pendaftaran
{
    public int IdPendaftaran { get; set; }

    public int? IdPasien { get; set; }

    public int? IdDokter { get; set; }

    public DateOnly? TanggalDaftar { get; set; }

    public string? JenisLayanan { get; set; }

    public string? StatusValidasi { get; set; } = "Pending";

    public Dokter? Dokter { get; set; }

    public ICollection<JadwalOperasi> JadwalOperasis { get; set; } = [];
}
