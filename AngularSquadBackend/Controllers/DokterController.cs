using System.Text.Json.Serialization;
using AngularSquadBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngularSquadBackend.Controllers;

/// <summary>Provides doctor master data with today's registrations and surgery schedules.</summary>
[ApiController]
[Route("api/dokter")]
[Authorize]
public class DokterController(AppDbContext dbContext) : ControllerBase
{
    /// <summary>Gets one doctor's master details and today's related activity.</summary>
    /// <param name="id">The doctor's identifier.</param>
    /// <param name="cancellationToken">The request cancellation token.</param>
    /// <returns>The doctor and today's registrations and surgery schedules.</returns>
    [HttpGet("{id:int}/details")]
    [ProducesResponseType<DokterMasterDetailResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DokterMasterDetailResponse>> GetDetails(
        int id,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var dokter = await dbContext.Dokters
            .AsNoTracking()
            .AsSplitQuery()
            .Include(item => item.Pendaftarans.Where(pendaftaran => pendaftaran.TanggalDaftar == today))
            .Include(item => item.JadwalOperasis.Where(jadwal => jadwal.TanggalOperasi == today))
            .SingleOrDefaultAsync(item => item.IdDokter == id, cancellationToken);

        if (dokter is null)
        {
            return NotFound();
        }

        var response = new DokterMasterDetailResponse(
            new DokterMasterDto(
                dokter.IdDokter,
                dokter.NamaDokter,
                dokter.Keahlian,
                dokter.MaxLayananHarian,
                dokter.Pendaftarans.Count,
                dokter.Pendaftarans
                    .OrderBy(pendaftaran => pendaftaran.IdPendaftaran)
                    .Select(pendaftaran => new PendaftaranDto(
                        pendaftaran.IdPendaftaran,
                        pendaftaran.IdPasien,
                        pendaftaran.TanggalDaftar,
                        pendaftaran.JenisLayanan,
                        pendaftaran.StatusValidasi))
                    .ToArray(),
                dokter.JadwalOperasis
                    .OrderBy(jadwal => jadwal.JamMulai)
                    .Select(jadwal => new JadwalOperasiDto(
                        jadwal.IdJadwalOperasi,
                        jadwal.IdPendaftaran,
                        jadwal.IdRuangOperasi,
                        jadwal.TanggalOperasi,
                        jadwal.JamMulai,
                        jadwal.JamSelesai,
                        jadwal.StatusOperasi))
                    .ToArray()));

        return Ok(response);
    }

    [HttpGet("dashboard-summary")]
    [ProducesResponseType<DokterDashboardSummary>(StatusCodes.Status200OK)]
    public async Task<ActionResult<DokterDashboardSummary>> GetDashboardSummary(
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var doctors = await dbContext.Dokters
            .AsNoTracking()
            .Select(dokter => new DoctorSummary(
                dokter.IdDokter,
                dokter.NamaDokter,
                dokter.Keahlian,
                dokter.StatusAktif,
                dokter.MaxLayananHarian,
                dbContext.Pendaftarans.Count(pendaftaran =>
                    pendaftaran.IdDokter == dokter.IdDokter
                    && pendaftaran.TanggalDaftar == today)))
            .ToArrayAsync(cancellationToken);

        var registrations = await dbContext.Pendaftarans
            .AsNoTracking()
            .Where(pendaftaran => pendaftaran.TanggalDaftar == today)
            .Select(pendaftaran => new { pendaftaran.JenisLayanan, pendaftaran.StatusValidasi })
            .ToArrayAsync(cancellationToken);

        var serviceStats = registrations
            .GroupBy(item => item.JenisLayanan ?? "Belum dipilih")
            .Select(group => new CountSummary(group.Key, group.Count()))
            .OrderByDescending(item => item.Count)
            .ToArray();

        var statusStats = registrations
            .GroupBy(item => item.StatusValidasi ?? "Pending")
            .Select(group => new CountSummary(group.Key, group.Count()))
            .OrderByDescending(item => item.Count)
            .ToArray();

        return Ok(new DokterDashboardSummary(
            doctors.Length,
            doctors.Count(dokter => dokter.StatusAktif == "Aktif"),
            doctors.Sum(dokter => dokter.MaxLayananHarian),
            registrations.Length,
            registrations.Count(item => item.StatusValidasi == "Pending"),
            registrations.Count(item => item.StatusValidasi == "Approved"),
            doctors,
            serviceStats,
            statusStats));
    }

    public sealed record CountSummary(string Name, int Count);

    public sealed record DoctorSummary(
        int Id,
        [property: JsonPropertyName("nama_dokter")] string NamaDokter,
        [property: JsonPropertyName("keahlian")] string? Keahlian,
        [property: JsonPropertyName("status_aktif")] string StatusAktif,
        [property: JsonPropertyName("max_layanan_harian")] int MaxLayananHarian,
        [property: JsonPropertyName("pendaftaran_hari_ini")] int PendaftaranHariIni);

    public sealed record DokterDashboardSummary(
        [property: JsonPropertyName("doctor_count")] int DoctorCount,
        [property: JsonPropertyName("active_doctor_count")] int ActiveDoctorCount,
        [property: JsonPropertyName("total_capacity")] int TotalCapacity,
        [property: JsonPropertyName("today_registration_count")] int TodayRegistrationCount,
        [property: JsonPropertyName("pending_registration_count")] int PendingRegistrationCount,
        [property: JsonPropertyName("approved_registration_count")] int ApprovedRegistrationCount,
        [property: JsonPropertyName("doctors")] IReadOnlyList<DoctorSummary> Doctors,
        [property: JsonPropertyName("service_stats")] IReadOnlyList<CountSummary> ServiceStats,
        [property: JsonPropertyName("status_stats")] IReadOnlyList<CountSummary> StatusStats);

    /// <summary>Doctor summary and the day's registrations and surgery schedule.</summary>
    public sealed record DokterMasterDetailResponse(
        [property: JsonPropertyName("master_dokter")] DokterMasterDto MasterDokter);

    /// <summary>Doctor master data with daily quota usage and related details.</summary>
    public sealed record DokterMasterDto(
        [property: JsonPropertyName("id_dokter")] int IdDokter,
        [property: JsonPropertyName("nama_dokter")] string NamaDokter,
        [property: JsonPropertyName("keahlian")] string? Keahlian,
        [property: JsonPropertyName("max_layanan_harian")] int MaxLayananHarian,
        [property: JsonPropertyName("kuota_terpakai_hari_ini")] int KuotaTerpakaiHariIni,
        [property: JsonPropertyName("detail_pendaftaran")] IReadOnlyList<PendaftaranDto> DetailPendaftaran,
        [property: JsonPropertyName("detail_jadwal_operasi")] IReadOnlyList<JadwalOperasiDto> DetailJadwalOperasi);

    /// <summary>A registration record for the current date.</summary>
    public sealed record PendaftaranDto(
        [property: JsonPropertyName("id_pendaftaran")] int IdPendaftaran,
        [property: JsonPropertyName("id_pasien")] int? IdPasien,
        [property: JsonPropertyName("tanggal_daftar")] DateOnly? TanggalDaftar,
        [property: JsonPropertyName("jenis_layanan")] string? JenisLayanan,
        [property: JsonPropertyName("status_validasi")] string? StatusValidasi);

    /// <summary>A surgery schedule for the current date.</summary>
    public sealed record JadwalOperasiDto(
        [property: JsonPropertyName("id_jadwal_operasi")] int IdJadwalOperasi,
        [property: JsonPropertyName("id_pendaftaran")] int? IdPendaftaran,
        [property: JsonPropertyName("id_ruang_operasi")] int? IdRuangOperasi,
        [property: JsonPropertyName("tanggal_operasi")] DateOnly? TanggalOperasi,
        [property: JsonPropertyName("jam_mulai")] TimeOnly? JamMulai,
        [property: JsonPropertyName("jam_selesai")] TimeOnly? JamSelesai,
        [property: JsonPropertyName("status_operasi")] string? StatusOperasi);
}
