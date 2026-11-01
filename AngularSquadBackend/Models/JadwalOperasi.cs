namespace AngularSquadBackend.Models;

public class JadwalOperasi
{
    public int IdJadwalOperasi { get; set; }

    public int? IdPendaftaran { get; set; }

    public int? IdRuangOperasi { get; set; }

    public int? IdDokter { get; set; }

    public DateOnly? TanggalOperasi { get; set; }

    public TimeOnly? JamMulai { get; set; }

    public TimeOnly? JamSelesai { get; set; }

    public string? StatusOperasi { get; set; } = "Terjadwal";

    public Pendaftaran? Pendaftaran { get; set; }

    public Dokter? Dokter { get; set; }
}
