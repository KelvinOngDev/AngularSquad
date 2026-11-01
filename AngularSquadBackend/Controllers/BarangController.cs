using AngularSquadBackend.Data;
using AngularSquadBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngularSquadBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BarangController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Barang>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await dbContext.Barangs.AsNoTracking().ToListAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Barang>> GetById(int id, CancellationToken cancellationToken)
    {
        var barang = await dbContext.Barangs.FindAsync([id], cancellationToken);
        return barang is null ? NotFound() : Ok(barang);
    }

    [HttpPost]
    public async Task<ActionResult<Barang>> Create(Barang barang, CancellationToken cancellationToken)
    {
        dbContext.Barangs.Add(barang);
        await dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = barang.Id }, barang);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Barang barang, CancellationToken cancellationToken)
    {
        if (id != barang.Id)
        {
            return BadRequest("Route id must match the Barang id.");
        }

        if (!await dbContext.Barangs.AnyAsync(item => item.Id == id, cancellationToken))
        {
            return NotFound();
        }

        dbContext.Entry(barang).State = EntityState.Modified;
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var barang = await dbContext.Barangs.FindAsync([id], cancellationToken);
        if (barang is null)
        {
            return NotFound();
        }

        dbContext.Barangs.Remove(barang);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
