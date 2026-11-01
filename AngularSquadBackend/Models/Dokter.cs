using System.ComponentModel.DataAnnotations;

namespace AngularSquadBackend.Models;

public class Dokter
{
    public int IdDokter { get; set; }

    [Required, MaxLength(100)]
    public required string NamaDokter { get; set; }

    [MaxLength(100)]
    public string? Keahlian { get; set; }

    public int MaxLayananHarian { get; set; } = 50;

    [MaxLength(8)]
    public string StatusAktif { get; set; } = "Aktif";

    public ICollection<Pendaftaran> Pendaftarans { get; set; } = [];

    public ICollection<JadwalOperasi> JadwalOperasis { get; set; } = [];
}
