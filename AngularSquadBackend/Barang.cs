using System.ComponentModel.DataAnnotations;

namespace AngularSquadBackend.Models;

public class Barang
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public required string KodeBarang { get; set; }

    [Required, MaxLength(150)]
    public required string NamaBarang { get; set; }

    public decimal Harga { get; set; }

    public int Stok { get; set; }
}