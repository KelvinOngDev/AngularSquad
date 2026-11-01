namespace AngularSquadBackend.Models;

public class PrivilegeUser
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int MenuId { get; set; }

    public bool CanRead { get; set; }

    public bool CanCreate { get; set; }

    public bool CanUpdate { get; set; }

    public bool CanDelete { get; set; }

    public User? User { get; set; }

    public Menu? Menu { get; set; }
}